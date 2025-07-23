import {
  CONNECTOR_KEY,
  type Maybe,
  type PredicateVersionWithMetadata,
} from '@fuel-connectors/common';
import {
  type Asset,
  type ConnectorMetadata,
  type FuelABI,
  FuelConnector,
  FuelConnectorEventTypes,
  type FuelConnectorEvents,
  type FuelEventArg,
  LocalStorage,
  type Network,
  type SelectNetworkArguments,
  type StorageAbstract,
  type TransactionRequestLike,
  type TransactionResponse,
  type Version,
} from 'fuels';
import {
  APPKIT_STORAGE_KEYS,
  HAS_WINDOW,
  REOWN_ICON,
  WINDOW,
} from './constants';
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

  private predicatesInstance: {
    ethereum: PredicateEvm;
    solana: PredicateSvm;
  };
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

    const appkitAdapters = this.config.appkit.options?.adapters ?? [];
    const namespaces = appkitAdapters.map((adapter) => adapter.namespace);
    if (!namespaces.includes('eip155') || !namespaces.includes('solana')) {
      throw new Error('ReownConnector requires Ethereum and Solana adapters');
    }
  }

  private setPredicateInstance() {
    if (this.config.appkit.getActiveChainNamespace() === 'eip155') {
      this.activeChain = 'ethereum';
      return;
    }

    this.activeChain = 'solana';
  }

  private async getConnectedNamespaces() {
    return this.storage.getItem(APPKIT_STORAGE_KEYS.CONNECTED_NAMESPACES);
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

        const state = await this.currentActivePredicate.getCurrentState();
        this.emit(this.events.connection, state.connection);
        this.emit(this.events.currentAccount, state.account);
        this.emit(this.events.accounts, state.accounts);
        return;
      }

      // Disconnecting
      if (
        account.status === 'disconnected' &&
        this.account &&
        this.account !== account.address
      ) {
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

  async connect(): Promise<boolean> {
    this.isConnecting = true;

    // If we already have an account, we don't need to open the appkit modal
    if (
      this.config.appkit.getAddress() &&
      this.config.appkit.getIsConnectedState()
    ) {
      this.setPredicateInstance();
      try {
        const connector = this.currentActivePredicate;
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
          // If we don't have any connected namespaces, we need to disconnect
          // For some reason, the appkit doesn't return the correct state after closing a wallet if there's something connected previously
          const connectedNamespaces = await this.getConnectedNamespaces();
          if (!connectedNamespaces) {
            await this.config.appkit.disconnect();
            this.isConnecting = false;
            clearInterval(interval);
            resolve(false);
            return;
          }

          this.setPredicateInstance();
          const connector = this.currentActivePredicate;
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

  private get currentActivePredicate(): PredicateEvm | PredicateSvm {
    return this.predicatesInstance[this.activeChain];
  }

  async isConnected(): Promise<boolean> {
    return this.currentActivePredicate.isConnected();
  }

  async disconnect(): Promise<boolean> {
    await this.config.appkit.disconnect();
    await this.predicatesInstance.ethereum.disconnect();
    await this.predicatesInstance.solana.disconnect();

    return await super.disconnect();
  }

  async accounts(): Promise<Array<string>> {
    return this.currentActivePredicate.accounts();
  }

  async currentAccount(): Promise<string | null> {
    return this.currentActivePredicate.currentAccount();
  }

  async signMessage(address: string, message: string): Promise<string> {
    return this.currentActivePredicate.signMessage(address, message);
  }

  async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<string | TransactionResponse> {
    return this.currentActivePredicate.sendTransaction(address, transaction);
  }

  async assets(): Promise<Array<Asset>> {
    return this.currentActivePredicate.assets();
  }

  async addAsset(asset: Asset): Promise<boolean> {
    return this.currentActivePredicate.addAsset(asset);
  }

  async addAssets(assets: Asset[]): Promise<boolean> {
    return this.currentActivePredicate.addAssets(assets);
  }

  async addAbi(contractId: string, abi: FuelABI): Promise<boolean> {
    return this.currentActivePredicate.addAbi(contractId, abi);
  }

  async getABI(contractId: string): Promise<FuelABI> {
    return this.currentActivePredicate.getAbi(contractId);
  }

  async hasABI(contractId: string): Promise<boolean> {
    return this.currentActivePredicate.hasAbi(contractId);
  }

  async currentNetwork(): Promise<Network> {
    return this.currentActivePredicate.currentNetwork();
  }

  async selectNetwork(network: SelectNetworkArguments): Promise<boolean> {
    return this.currentActivePredicate.selectNetwork(network);
  }

  async networks(): Promise<Network[]> {
    return this.currentActivePredicate.networks();
  }

  async addNetwork(networkUrl: string): Promise<boolean> {
    return this.currentActivePredicate.addNetwork(networkUrl);
  }

  async version(): Promise<Version> {
    return this.currentActivePredicate.version();
  }

  getAvailablePredicateVersions(): { id: string; generatedAt: number }[] {
    return this.currentActivePredicate.getAvailablePredicateVersions();
  }

  setSelectedPredicateVersion(versionId: string): void {
    this.currentActivePredicate.setSelectedPredicateVersion(versionId);
  }

  getSelectedPredicateVersion(): Maybe<string> {
    return this.currentActivePredicate.getSelectedPredicateVersion();
  }

  async switchPredicateVersion(versionId: string): Promise<void> {
    await this.currentActivePredicate.switchPredicateVersion(versionId);
  }

  async getSmartDefaultPredicateVersion(): Promise<Maybe<string>> {
    return await this.currentActivePredicate.getSmartDefaultPredicateVersion();
  }

  async getAllPredicateVersionsWithMetadata(): Promise<
    PredicateVersionWithMetadata[]
  > {
    return await this.currentActivePredicate.getAllPredicateVersionsWithMetadata();
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

  /**
   * ============================================================
   * Event Listener Utilities
   * ============================================================
   */
  public on<E extends FuelConnectorEvents['type'], D extends FuelEventArg<E>>(
    eventName: E,
    listener: (data: D) => void,
  ): this {
    this.predicatesInstance.solana.on(eventName, listener);
    this.predicatesInstance.ethereum.on(eventName, listener);
    return super.on(eventName, listener);
  }

  public off<E extends FuelConnectorEvents['type'], D extends FuelEventArg<E>>(
    eventName: E,
    listener: (data: D) => void,
  ): this {
    this.predicatesInstance.solana.off(eventName, listener);
    this.predicatesInstance.ethereum.off(eventName, listener);
    return super.off(eventName, listener);
  }
}
