import {
  type Config,
  type GetAccountReturnType,
  disconnect,
  getAccount,
  reconnect,
  watchAccount,
} from '@wagmi/core';
import type { Web3Modal } from '@web3modal/wagmi';
import {
  CHAIN_IDS,
  type ConnectorMetadata,
  FuelConnectorEventTypes,
  Provider as FuelProvider,
  LocalStorage,
  type StartConsolidateCoins,
  type StorageAbstract,
} from 'fuels';

import {
  type EIP1193Provider,
  EthereumWalletAdapter,
  HAS_WINDOW,
  type Maybe,
  PredicateConnector,
  type PredicateVersion,
  type PredicateWalletAdapter,
  type ProviderDictionary,
  WINDOW,
  getFuelPredicateAddresses,
  getOrThrow,
  getProviderUrl,
} from '@fuel-connectors/bako-predicate-connector';

import { ApiController } from '@web3modal/core';
import { ETHEREUM_ICON } from './constants';
import type { WalletConnectConfig } from './types';
import { getPredicateVersions, subscribeAndEnforceChain } from './utils';
import { createWagmiConfig, createWeb3ModalInstance } from './web3Modal';

export class WalletConnectConnector extends PredicateConnector {
  name = 'Ethereum Wallets';
  installed = true;
  events = FuelConnectorEventTypes;
  metadata: ConnectorMetadata = {
    image: ETHEREUM_ICON,
    install: {
      action: 'Install',
      description: 'Install Ethereum Wallet to connect to Fuel',
      link: 'https://ethereum.org/en/wallets/find-wallet/',
    },
  };

  private fuelProvider!: FuelProvider;
  private ethProvider!: EIP1193Provider;
  private web3Modal!: Web3Modal;
  private storage: StorageAbstract;
  private config: WalletConnectConfig = {} as WalletConnectConfig;

  constructor(config: WalletConnectConfig) {
    super();
    this.storage =
      config.storage || new LocalStorage(WINDOW?.localStorage as Storage);
    const wagmiConfig = config?.wagmiConfig ?? createWagmiConfig();

    if (wagmiConfig._internal.syncConnectedChain !== false) {
      subscribeAndEnforceChain(wagmiConfig);
    }

    this.customPredicate = config.predicateConfig || null;
    if (HAS_WINDOW) {
      this._config_providers({ ...config, wagmiConfig });
    }
  }

  private createModal() {
    this.clearSubscriptions();
    this.web3Modal = this.modalFactory(this.config);
    ApiController.prefetch();
    this.setupWatchers();
  }

  private modalFactory(config: WalletConnectConfig) {
    return createWeb3ModalInstance({
      projectId: config.projectId,
      wagmiConfig: config.wagmiConfig,
    });
  }

  private async handleConnect(
    account: NonNullable<GetAccountReturnType<Config>>,
    defaultAccount: string | null = null,
  ) {
    this.emit(this.events.connection, true);
    this.emit(
      this.events.currentAccount,
      defaultAccount ?? (account?.address as string),
    );
    this.emit(this.events.accounts, []);
  }

  private setupWatchers() {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) throw new Error('Wagmi config not found');

    this.subscribe(
      watchAccount(wagmiConfig, {
        onChange: async (account) => {
          switch (account.status) {
            case 'connected': {
              await this.handleConnect(account);
              break;
            }
            case 'disconnected': {
              this.emit(this.events.connection, false);
              this.emit(this.events.currentAccount, null);
              this.emit(this.events.accounts, []);
              break;
            }
          }
        },
      }),
    );
  }

  protected getWagmiConfig(): Maybe<Config> {
    return this.config?.wagmiConfig;
  }

  protected getWalletAdapter(): PredicateWalletAdapter {
    return new EthereumWalletAdapter();
  }

  protected getPredicateVersions(): Record<string, PredicateVersion> {
    return getPredicateVersions();
  }

  protected async configProviders(config: WalletConnectConfig = {}) {
    const network = getProviderUrl(config?.chainId ?? CHAIN_IDS.fuel.mainnet);
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || new FuelProvider(network),
    });
  }

  protected async walletAccounts(): Promise<Array<string>> {
    return Promise.resolve((await this.getAccountAddresses()) as Array<string>);
  }

  protected async getAccountAddress(): Promise<Maybe<string>> {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) return null;
    const addresses = await this.getAccountAddresses();
    if (!addresses) return null;
    const address = addresses[0];
    if (!address) return null;
    return address;
  }

  protected async getAccountAddresses(): Promise<Maybe<readonly string[]>> {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) return null;
    const { addresses = [] } = getAccount(wagmiConfig);

    return addresses;
  }

  protected async requireConnection() {
    const wagmiConfig = this.getWagmiConfig();
    if (!this.web3Modal) this.createModal();

    if (this.config.skipAutoReconnect || !wagmiConfig) return;

    const { status, connections } = wagmiConfig.state;

    if (status === 'connected' && connections.size > 0) {
      try {
        const account = getAccount(wagmiConfig);
        if (!account.isConnected || !account.address) {
          await disconnect(wagmiConfig);
          return;
        }

        const connector = account.connector;
        if (connector) {
          const provider = await connector.getProvider();
          if (!provider) {
            await disconnect(wagmiConfig);
            return;
          }
        }
      } catch {
        await disconnect(wagmiConfig);
        return;
      }
    }

    if (status === 'disconnected' && connections.size > 0) {
      await reconnect(wagmiConfig);
    }
  }

  protected async getProviders(): Promise<ProviderDictionary> {
    if (this.fuelProvider && this.ethProvider) {
      return {
        fuelProvider: this.fuelProvider,
        ethProvider: this.ethProvider,
      };
    }
    if (!this.fuelProvider) {
      this.fuelProvider = getOrThrow(
        await this.config.fuelProvider,
        'Fuel provider is not available',
      );
    }

    const wagmiConfig = this.getWagmiConfig();
    const ethProvider = wagmiConfig
      ? ((await getAccount(
          wagmiConfig,
        ).connector?.getProvider?.()) as EIP1193Provider)
      : undefined;

    return {
      fuelProvider: this.fuelProvider,
      ethProvider,
    };
  }

  public async disconnect(): Promise<boolean> {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) throw new Error('Wagmi config not found');

    const { connector, isConnected } = getAccount(wagmiConfig);
    await disconnect(wagmiConfig, {
      connector,
    });

    await super.disconnect();

    return isConnected || false;
  }

  async signMessageCustomCurve(message: string) {
    const { ethProvider } = await this._get_providers();
    if (!ethProvider) throw new Error('Eth provider not found');
    const accountAddress = await this.getAccountAddress();
    if (!accountAddress) throw new Error('No connected accounts');
    const signature = await ethProvider.request({
      method: 'personal_sign',
      params: [accountAddress, message],
    });
    return {
      curve: 'secp256k1',
      signature: signature as string,
    };
  }

  static getFuelPredicateAddresses() {
    const predicateConfig = Object.entries(getPredicateVersions())
      .sort(([, a], [, b]) => b.generatedAt - a.generatedAt)
      .map(([evmPredicateAddress, { predicate, generatedAt }]) => ({
        abi: predicate.abi,
        bin: predicate.bin,
        evmPredicate: {
          generatedAt,
          address: evmPredicateAddress,
        },
      }));

    const predicateAddresses = predicateConfig.map(
      ({ abi, bin, evmPredicate }) => ({
        fuelAddress: getFuelPredicateAddresses({
          predicate: { abi, bin },
        }),
        evmPredicate,
      }),
    );

    return predicateAddresses;
  }

  /**
   * @inheritdoc
   */
  async startConsolidation(opts: StartConsolidateCoins): Promise<void> {
    this.emit(FuelConnectorEventTypes.consolidateCoins, opts);
  }

  // ============================================================
  // Abstract method implementations
  // ============================================================

  /**
   * Configures providers based on connector configuration.
   */

  protected async _config_providers(config: WalletConnectConfig = {}) {
    return this.configProviders(config);
  }

  /**
   * Gets the current EVM address from the connected wallet.
   */

  protected _get_current_evm_address(): Maybe<string> {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) return null;
    const { address } = getAccount(wagmiConfig);
    return address || null;
  }

  /**
   * Checks if there is an active connection, throws if not.
   */

  protected async _require_connection() {
    return this.requireConnection();
  }

  /**
   * Gets the configured providers (Fuel and EVM).
   */

  protected async _get_providers(): Promise<ProviderDictionary> {
    return this.getProviders();
  }

  /**
   * Signs a message using the connected wallet.
   */

  protected async _sign_message(message: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const { ethProvider } = await this._get_providers();
      const currentAccount = this._get_current_evm_address();

      if (!ethProvider || !currentAccount) {
        reject(new Error('Provider or account not available'));
        return;
      }

      try {
        const signature = await ethProvider.request({
          method: 'personal_sign',
          params: [message, currentAccount],
        });

        resolve(signature as string);
      } catch (error: unknown) {
        const errorMessage = (error as Error).message.includes('rejected')
          ? 'User rejected the request'
          : (error as Error).message;

        reject(new Error(`Signing failed: ${errorMessage}`));
      }
    });
  }

  /**
   * Handles the wallet connection logic.
   */
  public async _connect(): Promise<boolean> {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) throw new Error('Wagmi config not found');

    try {
      const account = getAccount(wagmiConfig);

      if (account.isConnected && account.address) {
        const connector = account.connector;
        if (connector) {
          const provider = await connector.getProvider();
          if (provider) {
            return true;
          }
        }
      }
    } catch {
      console.error(
        'Existing connection is invalid, proceeding with new connection',
      );
    }

    this.createModal();
    this.web3Modal.open();

    return new Promise<boolean>((resolve) => {
      const unsub = this.web3Modal.subscribeEvents(async (event) => {
        switch (event.data.event) {
          case 'MODAL_OPEN':
            this.createModal();
            break;

          case 'CONNECT_SUCCESS': {
            unsub();
            resolve(true);
            break;
          }

          case 'MODAL_CLOSE':
          case 'CONNECT_ERROR': {
            unsub();
            resolve(false);
            break;
          }
        }
      });
    });
  }

  /**
   * Handles the wallet disconnection logic.
   */
  public async _disconnect(): Promise<boolean> {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) throw new Error('Wagmi config not found');

    const { connector, isConnected } = getAccount(wagmiConfig);
    await disconnect(wagmiConfig, {
      connector,
    });

    return isConnected || false;
  }
}
