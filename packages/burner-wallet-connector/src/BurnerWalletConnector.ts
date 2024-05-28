import {
  type AbiMap,
  type Asset,
  type ConnectorMetadata,
  FuelConnector,
  FuelConnectorEventTypes,
  type JsonAbi,
  type Network,
  Provider,
  type StorageAbstract,
  type TransactionRequestLike,
  type Version,
  Wallet,
  type WalletUnlocked,
} from 'fuels';
import {
  BURNER_WALLET_ICON,
  BURNER_WALLET_PRIVATE_KEY,
  TESTNET_URL,
  WINDOW,
} from './constants';
import type { BurnerWalletConfig } from './types';

export class BurnerWalletConnector extends FuelConnector {
  static defaultProviderUrl: string = TESTNET_URL;
  name = 'Burner Wallet';

  connected = false;
  installed = false;

  events = FuelConnectorEventTypes;

  metadata: ConnectorMetadata = {
    image: BURNER_WALLET_ICON,
    install: {
      action: '',
      description: 'Burner Wallet to connect to Fuel',
      link: '',
    },
  };

  private burnerWallet: WalletUnlocked | null = null;
  private burnerWalletProvider: Provider | null = null;
  private storage: StorageAbstract;

  constructor(config: BurnerWalletConfig = {}) {
    super();
    this.storage = this.getStorage(config.storage);
    this.setupBurnerWallet();
  }

  private async getProvider(config: BurnerWalletConfig = {}) {
    if (!this.burnerWalletProvider) {
      this.burnerWalletProvider = await (config.fuelProvider ||
        Provider.create(BurnerWalletConnector.defaultProviderUrl));
    }
    return this.burnerWalletProvider;
  }

  private generatePrivateKey() {
    const privateKey = Wallet.generate().privateKey;
    this.storage.setItem(BURNER_WALLET_PRIVATE_KEY, privateKey);
    return privateKey;
  }

  private async setupBurnerWallet(createWallet = false) {
    if (this.burnerWallet) return;
    let privateKey = await this.storage.getItem(BURNER_WALLET_PRIVATE_KEY);
    if (createWallet && !privateKey) {
      privateKey = this.generatePrivateKey();
    }
    if (!privateKey) return;

    this.burnerWallet = Wallet.fromPrivateKey(
      privateKey,
      await this.getProvider(),
    );

    return this.burnerWallet;
  }

  private getStorage(storage?: StorageAbstract) {
    const _storage =
      storage ?? (WINDOW.localStorage as unknown as StorageAbstract);
    if (!_storage) {
      throw new Error('No storage provided');
    }

    return _storage;
  }

  /**
   * ============================================================
   * Connector methods
   * ============================================================
   */
  async ping(): Promise<boolean> {
    await this.setupBurnerWallet();
    return true;
  }

  async version(): Promise<Version> {
    return { app: '0.0.0', network: '0.0.0' };
  }

  async isConnected(): Promise<boolean> {
    await this.setupBurnerWallet(false);
    return !!this.burnerWallet;
  }

  async connect(): Promise<boolean> {
    await this.setupBurnerWallet(true);
    const accountAddress = this.burnerWallet?.address.toAddress();

    this.emit(this.events.connection, true);
    this.emit(this.events.currentAccount, accountAddress);
    this.emit(this.events.accounts, [accountAddress]);

    return true;
  }

  async accounts(): Promise<string[]> {
    if (!this.burnerWallet) {
      throw Error('Wallet not connected');
    }

    const account = this.burnerWallet.address.toAddress();

    if (!account) {
      return [];
    }

    return [account as `fuel${string}`];
  }

  async disconnect(): Promise<boolean> {
    this.burnerWalletProvider = null;
    this.burnerWallet = null;
    this.storage.removeItem(BURNER_WALLET_PRIVATE_KEY);
    this.emit(this.events.connection, false);
    this.emit(this.events.currentAccount, null);
    this.emit(this.events.accounts, []);
    return this.connected;
  }

  async signMessage(address: string, message: string): Promise<string> {
    if (!this.burnerWallet) {
      throw Error('Wallet not connected');
    }

    if (address !== this.burnerWallet.address.toString()) {
      throw Error('Address not found for the connector');
    }

    const signMessage = await this.burnerWallet.signMessage(message);

    return signMessage;
  }

  async sendTransaction(
    _address: string,
    transaction: TransactionRequestLike,
  ): Promise<string> {
    if (!this.burnerWallet) {
      throw Error('Wallet not connected');
    }

    if (_address !== this.burnerWallet.address.toString()) {
      throw Error('Address not found for the connector');
    }

    const transactionRequest = await this.burnerWallet.sendTransaction(
      transaction,
      { awaitExecution: true },
    );

    return transactionRequest.id;
  }

  async currentAccount(): Promise<string | null> {
    if (!this.burnerWallet) {
      throw Error('Wallet not connected');
    }

    return this.burnerWallet.address.toString() || null;
  }

  async addAssets(_assets: Asset[]): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async addAsset(_asset: Asset): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async assets(): Promise<Array<Asset>> {
    return [];
  }

  async addNetwork(_networkUrl: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async selectNetwork(_network: Network): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async networks(): Promise<Network[]> {
    return [await this.currentNetwork()];
  }

  async currentNetwork(): Promise<Network> {
    const provider = await this.getProvider();
    const chainId = provider.getChainId();

    return {
      chainId,
      url: provider.url ?? '',
    };
  }

  async addAbi(_abiMap: AbiMap): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async getAbi(_contractId: string): Promise<JsonAbi> {
    throw Error('Method not implemented.');
  }

  async hasAbi(_contractId: string): Promise<boolean> {
    throw Error('Method not implemented.');
  }
}
