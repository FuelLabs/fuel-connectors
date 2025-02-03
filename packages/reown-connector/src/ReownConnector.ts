import {
  CONNECTOR_KEY,
  EthereumWalletAdapter,
  type PredicateConnector,
  getFuelPredicateAddresses,
} from '@fuel-connectors/common';
import { PREDICATE_VERSIONS } from '@fuel-connectors/evm-predicates';
import {
  type Asset,
  type ConnectorMetadata,
  type FuelABI,
  FuelConnector,
  FuelConnectorEventTypes,
  LocalStorage,
  type Network,
  type SelectNetworkArguments,
  type StorageAbstract,
  type TransactionRequestLike,
  type Version,
} from 'fuels';
import { WINDOW } from './constants';
import { PredicateEvm } from './predicates/evm/PredicateEvm';
import { ETHEREUM_ICON } from './predicates/evm/constants';
import { PredicateSvm } from './predicates/svm/PredicateSvm';
import type { ReownChain, ReownConnectorConfig } from './types';

export class ReownConnector extends FuelConnector {
  name = 'Ethereum / Solana Wallets';
  installed = true;
  events = FuelConnectorEventTypes;
  metadata: ConnectorMetadata = {
    image: ETHEREUM_ICON, // @TODO: Put a better icon to match Solana and ETH
    install: {
      action: 'Install',
      description: 'Install Ethereum or Solana Wallet to connect to Fuel',
      link: 'https://ethereum.org/en/wallets/find-wallet/', // @TODO: Put a better link
    },
  };

  private predicatesInstance: Record<ReownChain, PredicateConnector>;
  private activeChain!: ReownChain;
  private config: ReownConnectorConfig;
  private storage: StorageAbstract;
  private isConnecting = false;
  private account: string | undefined;

  constructor(config: ReownConnectorConfig) {
    super();

    this.storage =
      config.storage || new LocalStorage(WINDOW?.localStorage as Storage);
    this.config = config;

    this.watchCurrentAccount();
    this.predicatesInstance = {
      ethereum: new PredicateEvm(this.config, this.storage),
      solana: new PredicateSvm(this.config),
    };
  }

  private setPredicateInstance() {
    if (this.config.appkit.getActiveChainNamespace() === 'eip155') {
      this.activeChain = 'ethereum';
      return;
    }

    this.activeChain = 'solana';
  }

  private watchCurrentAccount() {
    this.config.appkit.subscribeAccount(async (account) => {
      // If we are already connecting, we don't want to do anything
      // This is mainly for reconnecting (e.g. page reload)
      if (this.isConnecting) {
        return;
      }

      const currentConnector = await this.storage.getItem(CONNECTOR_KEY);
      const isSameConnector = currentConnector === this.name;

      // We don't want to reconnect if we are using a different connector
      if (!isSameConnector) {
        return;
      }

      // Reconnecting
      if (account.status === 'connected' && account.address !== this.account) {
        this.setPredicateInstance();
        this.account = account.address;
        await this.predicatesInstance[this.activeChain].emitConnect();
        return;
      }

      // Disconnecting
      if (account.status === 'disconnected' && this.account) {
        this.account = undefined;
        this.emit(this.events.connection, false);
        this.emit(this.events.accounts, []);
        this.emit(this.events.currentAccount, null);
        return;
      }
    });
  }

  /**
   * ============================================================
   * Connector methods
   * ============================================================
   */
  async ping(): Promise<boolean> {
    return true;
  }

  async isConnected(): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].isConnected();
  }

  async connect(): Promise<boolean> {
    this.isConnecting = true;

    // If we already have an account, we don't need to open the appkit modal
    if (this.config.appkit.getAddress()) {
      this.setPredicateInstance();
      try {
        const connector = this.predicatesInstance[this.activeChain];
        const res = await connector.connect();
        await connector.emitConnect();
        this.isConnecting = false;
        return res;
      } catch (err) {
        this.isConnecting = false;
        throw err;
      }
    }

    // New connection
    await this.config.appkit.open();

    return new Promise((resolve, reject) => {
      this.config.appkit.subscribeAccount(async (account) => {
        // User has just connected (this is a good approach to handle any chain)
        // We need to update the predicate instance to the correct chain
        // Since some wallets allow to switch between chains (e.g. Phantom)
        if (account.address && account.address !== this.account) {
          this.setPredicateInstance();
          this.account = account.address;

          const connector = this.predicatesInstance[this.activeChain];

          try {
            await connector.connect();
            await connector.emitConnect();
            this.isConnecting = false;
            resolve(true);
          } catch (err) {
            this.isConnecting = false;
            reject(err);
          }
        }

        // User/wallet has disconnected during connection flow
        if (!account.address && this.account) {
          this.account = undefined;
          this.isConnecting = false;
          resolve(false);
          return;
        }
      });

      // Just to monitoring close modal and connection is not established yet
      // So we disable "connecting" state and allow user to connect again
      const unsub = this.config.appkit.subscribeEvents((event) => {
        switch (event.data.event) {
          case 'MODAL_CLOSE':
          case 'CONNECT_ERROR': {
            if (this.account) {
              return;
            }

            this.isConnecting = false;
            resolve(false);
            unsub?.();
            break;
          }
        }
      });
    });
  }

  async disconnect(): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].disconnect();
  }

  async accounts(): Promise<Array<string>> {
    return this.predicatesInstance[this.activeChain].accounts();
  }

  async currentAccount(): Promise<string | null> {
    return this.predicatesInstance[this.activeChain].currentAccount();
  }

  async signMessage(address: string, message: string): Promise<string> {
    return this.predicatesInstance[this.activeChain].signMessage(
      address,
      message,
    );
  }

  async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<string> {
    return this.predicatesInstance[this.activeChain].sendTransaction(
      address,
      transaction,
    );
  }

  async assets(): Promise<Array<Asset>> {
    return this.predicatesInstance[this.activeChain].assets();
  }

  async addAsset(asset: Asset): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].addAsset(asset);
  }

  async addAssets(assets: Asset[]): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].addAssets(assets);
  }

  async addAbi(contractId: string, abi: FuelABI): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].addAbi(contractId, abi);
  }

  async getABI(contractId: string): Promise<FuelABI> {
    return this.predicatesInstance[this.activeChain].getAbi(contractId);
  }

  async hasABI(contractId: string): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].hasAbi(contractId);
  }

  async currentNetwork(): Promise<Network> {
    return this.predicatesInstance[this.activeChain].currentNetwork();
  }

  async selectNetwork(network: SelectNetworkArguments): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].selectNetwork(network);
  }

  async networks(): Promise<Network[]> {
    return this.predicatesInstance[this.activeChain].networks();
  }

  async addNetwork(networkUrl: string): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].addNetwork(networkUrl);
  }

  async version(): Promise<Version> {
    return this.predicatesInstance[this.activeChain].version();
  }

  /**
   * ============================================================
   * Predicate Utilities
   * ============================================================
   */
  // @TODO: Put back solana fuel predicate address
  // Receive address + chain name (ethereum or solana)
  static getFuelPredicateAddresses(ethAddress: string) {
    const predicateConfig = Object.entries(PREDICATE_VERSIONS)
      .sort(([, a], [, b]) => b.generatedAt - a.generatedAt)
      .map(([evmPredicateAddress, { predicate, generatedAt }]) => ({
        abi: predicate.abi,
        bin: predicate.bin,
        evmPredicate: {
          generatedAt,
          address: evmPredicateAddress,
        },
      }));

    const address = new EthereumWalletAdapter().convertAddress(ethAddress);
    const predicateAddresses = predicateConfig.map(
      ({ abi, bin, evmPredicate }) => ({
        fuelAddress: getFuelPredicateAddresses({
          signerAddress: address,
          predicate: { abi, bin },
        }),
        evmPredicate,
      }),
    );

    return predicateAddresses;
  }
}
