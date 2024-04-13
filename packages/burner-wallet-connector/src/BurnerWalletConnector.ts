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
  BETA_5_URL,
  BURNER_WALLET_CONNECTED,
  BURNER_WALLET_ICON,
  BURNER_WALLET_PRIVATE_KEY,
  WINDOW,
} from './constants';
import type { BurnerWalletConfig } from './types';

export class BurnerWalletConnector extends FuelConnector {
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

  burnerWallet: WalletUnlocked | null = null;
  burnerWalletProvider: Provider | null = null;
  burnerWalletPrivateKey: string | null = null;

  private config: BurnerWalletConfig = {};
  private storage: StorageAbstract;

  constructor(config: BurnerWalletConfig = {}) {
    super();

    this.config = config;
    this.storage = this.getStorage(config.storage);

    this.configFuelProvider(config);
    this.setupBurnerWallet();
  }

  async configFuelProvider(config: BurnerWalletConfig = {}) {
    this.config.fuelProvider =
      config.fuelProvider || Provider.create(BETA_5_URL);
  }

  async setupBurnerWallet() {
    const privateKey = await this.storage.getItem(BURNER_WALLET_PRIVATE_KEY);

    if (privateKey) {
      this.storage.setItem(BURNER_WALLET_ICON, privateKey);
    }

    if (!privateKey) {
      this.burnerWallet = Wallet.generate({
        provider: await this.config.fuelProvider,
      });

      this.burnerWalletProvider = this.burnerWallet.provider;
      this.burnerWalletPrivateKey = this.burnerWallet.privateKey;

      this.storage.setItem(
        BURNER_WALLET_PRIVATE_KEY,
        this.burnerWalletPrivateKey,
      );

      return this.burnerWallet;
    }

    this.burnerWallet = Wallet.fromPrivateKey(
      privateKey,
      await this.config.fuelProvider,
    );

    this.burnerWalletProvider = this.burnerWallet.provider;
    this.burnerWalletPrivateKey = this.burnerWallet.privateKey;

    return this.burnerWallet;
  }

  private getStorage(storage?: StorageAbstract) {
    const _storage =
      storage ?? (WINDOW.sessionStorage as unknown as StorageAbstract);
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
    await this.configFuelProvider();
    await this.setupBurnerWallet();

    return true;
  }

  async version(): Promise<Version> {
    return { app: '0.0.0', network: '0.0.0' };
  }

  async isConnected(): Promise<boolean> {
    const connected =
      (await this.storage.getItem(BURNER_WALLET_CONNECTED)) === 'true';

    if (!connected) {
      return false;
    }

    const account = this.burnerWallet?.address.toString();

    return !!account && account.length > 0;
  }

  async connect(): Promise<boolean> {
    if (!(await this.isConnected())) {
      if (!this.burnerWalletProvider) {
        throw Error('Burner Wallet Provider not found');
      }

      await this.setupBurnerWallet();

      this.burnerWalletProvider = this.burnerWallet?.connect(
        this.burnerWalletProvider,
      ) as Provider;

      this.storage.setItem(BURNER_WALLET_CONNECTED, 'true');
    }

    this.emit(this.events.connection, true);
    this.emit(
      this.events.currentAccount,
      this.burnerWallet?.address.toAddress(),
    );
    this.emit(this.events.accounts, [this.burnerWallet?.address.toAddress()]);

    return this.connected;
  }

  async accounts(): Promise<string[]> {
    const account = this.burnerWallet?.address.toAddress();

    if (!account) {
      return [];
    }

    return [account as `fuel${string}`];
  }

  async disconnect(): Promise<boolean> {
    if (await this.isConnected()) {
      this.burnerWalletPrivateKey = null;
      this.burnerWalletProvider = null;
      this.burnerWallet = null;
    }

    this.storage.setItem(BURNER_WALLET_CONNECTED, 'false');

    this.emit(this.events.connection, false);
    this.emit(this.events.currentAccount, null);
    this.emit(this.events.accounts, []);

    return this.connected;
  }

  async signMessage(_address: string, _message: string): Promise<string> {
    const signMessage = await this.burnerWallet?.signMessage(_message);

    return signMessage as string;
  }

  async sendTransaction(
    _address: string,
    transaction: TransactionRequestLike,
  ): Promise<string> {
    const transactionRequest = await this.burnerWallet?.sendTransaction(
      transaction,
      { awaitExecution: true },
    );

    if (!transactionRequest) {
      throw Error('Transaction request not found');
    }

    return transactionRequest?.id;
  }

  async currentAccount(): Promise<string | null> {
    return this.burnerWallet?.address.toString() || null;
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
    if (!this.burnerWalletProvider) {
      throw Error('Burner Wallet Provider not found');
    }

    const { chainId } = await this.burnerWalletProvider.getNetwork();

    return {
      chainId: Number(chainId),
      url: this.burnerWalletProvider.url,
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
