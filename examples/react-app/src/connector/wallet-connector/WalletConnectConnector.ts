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
} from 'fuels';

import { ApiController } from '@web3modal/core';
import {
  type EIP1193Provider,
  type Maybe,
  PredicateConnector,
  type ProviderDictionary,
  getOrThrow,
  getProviderUrl,
} from '../common';
import { ETHEREUM_ICON, HAS_WINDOW } from './constants';
import type { WalletConnectConfig } from './types';
import { createWagmiConfig, createWeb3ModalInstance } from './web3Modal';

/**
 * WalletConnect connector implementation for Ethereum wallets.
 * Extends PredicateConnector to provide WalletConnect/Web3Modal integration.
 */
export class WalletConnectConnector extends PredicateConnector {
  // Connector metadata
  public name = 'Ethereum Wallets';
  public installed = true;
  public events = FuelConnectorEventTypes;
  public metadata: ConnectorMetadata = {
    image: ETHEREUM_ICON,
    install: {
      action: 'Install',
      description: 'Install Ethereum Wallet to connect to Fuel',
      link: 'https://ethereum.org/en/wallets/find-wallet/',
    },
  };

  // Private properties for internal state management
  private fuelProvider!: FuelProvider;
  private ethProvider!: EIP1193Provider;
  private web3Modal!: Web3Modal;
  private config: WalletConnectConfig = {} as WalletConnectConfig;

  constructor(config: WalletConnectConfig) {
    super();

    const wagmiConfig = config?.wagmiConfig ?? createWagmiConfig();
    this.customPredicate = config.predicateConfig || null;

    if (HAS_WINDOW) {
      this._config_providers({ ...config, wagmiConfig });
    }
  }

  // ============================================================
  // Abstract method implementations
  // ============================================================

  /**
   * Configures providers based on connector configuration.
   */
  protected async _config_providers(config: WalletConnectConfig = {}) {
    const networkUrl = getProviderUrl(
      config?.chainId ?? CHAIN_IDS.fuel.mainnet,
    );
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || new FuelProvider(networkUrl),
    });
  }

  /**
   * Gets the current EVM address from the connected wallet.
   */
  protected _get_current_evm_address(): Maybe<string> {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) return null;

    const { addresses = [] } = getAccount(wagmiConfig);
    if (addresses.length === 0) return null;

    return addresses[0];
  }

  /**
   * Checks if there is an active connection, throws if not.
   */
  protected async _require_connection() {
    const wagmiConfig = this.getWagmiConfig();
    if (!this.web3Modal) this.createModal();

    if (this.config.skipAutoReconnect || !wagmiConfig) return;

    const { status, connections } = wagmiConfig.state;
    if (status === 'disconnected' && connections.size > 0) {
      await reconnect(wagmiConfig);
    }
  }

  /**
   * Gets the configured providers (Fuel and EVM).
   */
  protected async _get_providers(): Promise<ProviderDictionary> {
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
        await this._disconnect();
        console.log('Signing failed:', error);
        reject(
          new Error(
            `Signing failed: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          ),
        );
      }
    });
  }

  /**
   * Handles the wallet connection logic.
   */
  public async _connect(): Promise<boolean> {
    console.log('[CONNECT] Connecting to Ethereum Wallets...');
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) throw new Error('Wagmi config not found');

    console.log('[CONNECT] Creating Web3Modal instance...');

    // Create and display the modal
    this.createModal();
    this.web3Modal.open();

    console.log('[CONNECT] Waiting for connection...');
    return new Promise<boolean>((resolve) => {
      const unsub = this.web3Modal.subscribeEvents(async (event) => {
        switch (event.data.event) {
          case 'MODAL_OPEN':
            console.log('[CONNECT] Modal opened');
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

  // ============================================================
  // Public methods
  // ============================================================

  /**
   * Signs a message with custom curve support.
   */
  async signMessageCustomCurve(message: string) {
    const { ethProvider } = await this._get_providers();
    if (!ethProvider) throw new Error('Eth provider not found');

    const accountAddress = await this._get_current_evm_address();
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

  // ============================================================
  // Private helper methods
  // ============================================================

  /**
   * Gets the Wagmi configuration.
   */
  protected getWagmiConfig(): Maybe<Config> {
    return this.config?.wagmiConfig;
  }

  /**
   * Creates a new Web3Modal instance.
   */
  private createModal() {
    this.clearSubscriptions();
    this.web3Modal = this.modalFactory(this.config);
    ApiController.prefetch();
    this.setupWatchers();
  }

  /**
   * Factory method for creating Web3Modal instances.
   */
  private modalFactory(config: WalletConnectConfig) {
    return createWeb3ModalInstance({
      projectId: config.projectId,
      wagmiConfig: config.wagmiConfig,
    });
  }

  /**
   * Handles successful wallet connections.
   */
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

  /**
   * Sets up event watchers for account changes.
   */
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
}
