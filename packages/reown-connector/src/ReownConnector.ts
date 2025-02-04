import {
  CONNECTOR_KEY,
  type PredicateConnector,
} from '@fuel-connectors/common';
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
import { HAS_WINDOW, REOWN_ICON, WINDOW } from './constants';
import { PredicateEvm } from './predicates/evm/PredicateEvm';
import { PredicateSvm } from './predicates/svm/PredicateSvm';
import type {
  GetFuelPredicateAddressesParams,
  ReownChain,
  ReownConnectorConfig,
} from './types';

export class ReownConnector extends FuelConnector {
  name = 'Ethereum / Solana Wallets';
  installed = true;
  events = FuelConnectorEventTypes;
  metadata: ConnectorMetadata = {
    image: REOWN_ICON,
    install: {
      action: '',
      description: '',
      link: '',
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
    if (!HAS_WINDOW) return;
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
      if (
        account.status === 'connected' &&
        account.address &&
        account.address !== this.account
      ) {
        this.setPredicateInstance();
        this.account = account.address;

        const state =
          await this.predicatesInstance[this.activeChain].getCurrentState();
        this.emit(this.events.connection, state.connection);
        this.emit(this.events.currentAccount, state.account);
        this.emit(this.events.accounts, state.accounts);

        // console.log('Reconnecting', this.account, account.address);
        return;
      }

      // Disconnecting
      if (
        account.status === 'disconnected' &&
        this.account &&
        this.account !== account.address
      ) {
        console.log(
          'Disconnecting',
          this.account,
          this.config.appkit.getIsConnectedState(),
        );
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
    if (
      this.config.appkit.getAddress() &&
      this.config.appkit.getIsConnectedState()
    ) {
      this.setPredicateInstance();
      try {
        const connector = this.predicatesInstance[this.activeChain];
        const res = await connector.connect();
        const state = await connector.getCurrentState();
        this.emit(this.events.connection, state.connection);
        this.emit(this.events.currentAccount, state.account);
        this.emit(this.events.accounts, state.accounts);
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
      const interval = setInterval(async () => {
        const address = this.config.appkit.getAddress();
        const isModalOpen = this.config.appkit.isOpen();

        // Idle state
        if (!isModalOpen && !address) {
          this.isConnecting = false;
          clearInterval(interval);
          resolve(false);
          return;
        }

        // Connected something
        if (address && address !== this.account) {
          this.setPredicateInstance();
          const connector = this.predicatesInstance[this.activeChain];
          this.account = address;

          try {
            await connector.connect();
            const state = await connector.getCurrentState();
            this.emit(this.events.connection, state.connection);
            this.emit(this.events.currentAccount, state.account);
            this.emit(this.events.accounts, state.accounts);
            resolve(true);
          } catch (err) {
            reject(err);
          } finally {
            this.isConnecting = false;
            clearInterval(interval);
          }
        }

        // Disconnected somehow
        if (!address && this.account) {
          this.account = undefined;
          this.isConnecting = false;
          clearInterval(interval);
          resolve(false);
        }
      }, 300);
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
  public static getFuelPredicateAddresses({
    address,
    chain,
  }: GetFuelPredicateAddressesParams) {
    if (chain === 'ethereum') {
      return PredicateEvm.getFuelPredicateAddresses(address);
    }

    return PredicateSvm.getFuelPredicateAddresses(address);
  }
}
