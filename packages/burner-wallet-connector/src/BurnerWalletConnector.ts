import { getProviderUrl } from '@fuel-connectors/common';
import {
  type AbiMap,
  type Asset,
  CHAIN_IDS,
  type ConnectorMetadata,
  FuelConnector,
  FuelConnectorEventTypes,
  type JsonAbi,
  type Network,
  Provider,
  type SelectNetworkArguments,
  type StorageAbstract,
  type TransactionRequestLike,
  type Version,
  Wallet,
  type WalletUnlocked,
} from 'fuels';
import { InMemoryStorage } from './InMemoryStorage';
import {
  BURNER_SESSION_DETECTED_MESSAGE,
  BURNER_WALLET_ICON,
  BURNER_WALLET_PRIVATE_KEY,
  BURNER_WALLET_STATUS,
  HAS_WINDOW,
} from './constants';
import type { BurnerWalletConfig } from './types';

export class BurnerWalletConnector extends FuelConnector {
  name = 'Burner Wallet';

  connected = false;
  installed = true;
  external = false;

  events = FuelConnectorEventTypes;

  metadata: ConnectorMetadata = {
    image: BURNER_WALLET_ICON,
    install: {
      action: '',
      description: 'Burner Wallet to connect to Fuel',
      link: '',
    },
  };

  usePrepareForSend = true;

  private burnerWallet: WalletUnlocked | null = null;
  private fuelProvider: Provider | null = null;
  private storage: StorageAbstract | Storage;
  private config: BurnerWalletConfig = {};

  constructor(config: BurnerWalletConfig = {}) {
    super();

    this.storage = this.getStorage(config.storage);
    if (HAS_WINDOW) {
      this.configProvider(config);
    }
  }

  private configProvider(config: BurnerWalletConfig = {}) {
    const network = getProviderUrl(config.chainId ?? CHAIN_IDS.fuel.testnet);
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || Provider.create(network),
    });
  }

  private async getProvider() {
    if (!this.config.fuelProvider) {
      throw new Error('Fuel provider not found');
    }

    if (!this.fuelProvider) {
      this.fuelProvider = await this.config.fuelProvider;
    }

    return {
      fuelProvider: this.fuelProvider,
    };
  }

  private async generatePrivateKey() {
    const { privateKey } = Wallet.generate();
    await this.storage.setItem(BURNER_WALLET_PRIVATE_KEY, privateKey);
    return privateKey;
  }

  private async getPrivateKey(): Promise<string | null> {
    const privateKey =
      (await this.storage.getItem(BURNER_WALLET_PRIVATE_KEY)) || null;
    return privateKey;
  }

  private async getStatus(): Promise<string | null> {
    const status = (await this.storage.getItem(BURNER_WALLET_STATUS)) || null;
    return status;
  }

  private async setupBurnerWallet(createWallet = false) {
    if (this.burnerWallet) return;

    let privateKey = await this.getPrivateKey();
    if (
      createWallet &&
      (!privateKey || !window.confirm(BURNER_SESSION_DETECTED_MESSAGE))
    ) {
      privateKey = await this.generatePrivateKey();
    }

    if (!privateKey) return;

    const { fuelProvider } = await this.getProvider();
    this.burnerWallet = Wallet.fromPrivateKey(privateKey, fuelProvider);

    return this.burnerWallet;
  }

  private getStorage(
    storage: StorageAbstract | undefined,
  ): StorageAbstract | Storage {
    if (storage) {
      return storage;
    }

    if (typeof window === 'undefined') {
      return new InMemoryStorage();
    }

    return window.localStorage;
  }

  /**
   * ============================================================
   * Connector methods
   * ============================================================
   */
  async ping(): Promise<boolean> {
    return true;
  }

  async version(): Promise<Version> {
    return { app: '0.0.0', network: '0.0.0' };
  }

  async isConnected(): Promise<boolean> {
    try {
      const status = await this.getStatus();
      if (status !== 'connected') return false;

      await this.setupBurnerWallet();
      return !!this.burnerWallet;
    } catch {
      return false;
    }
  }

  async connect(): Promise<boolean> {
    try {
      await Promise.all([
        this.setupBurnerWallet(true),
        this.storage.setItem(BURNER_WALLET_STATUS, 'connected'),
      ]);

      const accountAddress = this.burnerWallet?.address.toString();

      this.emit(this.events.connection, true);
      this.emit(this.events.currentAccount, accountAddress);
      this.emit(this.events.accounts, [accountAddress]);

      return true;
    } catch {
      return false;
    }
  }

  async accounts(): Promise<string[]> {
    if (!this.burnerWallet) {
      throw Error('Wallet not connected');
    }

    const account = this.burnerWallet.address.toString();

    if (!account) {
      return [];
    }

    return [account as `fuel${string}`];
  }

  async disconnect(): Promise<boolean> {
    await this.storage.setItem(BURNER_WALLET_STATUS, 'disconnected');

    this.burnerWallet = null;
    this.emit(this.events.connection, false);
    this.emit(this.events.currentAccount, null);
    this.emit(this.events.accounts, []);

    return false;
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

    const transactionRequest =
      await this.burnerWallet.sendTransaction(transaction);

    return transactionRequest.id;
  }

  public async prepareForSend(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<TransactionRequestLike> {
    if (!this.burnerWallet) {
      throw Error('Wallet not connected');
    }

    if (address !== this.burnerWallet.address.toString()) {
      throw Error('Address not found for the connector');
    }

    const signedTranasctionRequest =
      await this.burnerWallet.populateTransactionWitnessesSignature(
        transaction,
      );

    return signedTranasctionRequest;
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

  async selectNetwork(_network: SelectNetworkArguments): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async networks(): Promise<Network[]> {
    return [await this.currentNetwork()];
  }

  async currentNetwork(): Promise<Network> {
    const { fuelProvider } = await this.getProvider();
    const chainId = fuelProvider.getChainId();

    return {
      chainId,
      url: fuelProvider.url ?? '',
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
