import {
  type AbiMap,
  type Asset,
  type ConnectorMetadata,
  FuelConnector,
  FuelConnectorEventTypes,
  type JsonAbi,
  type Network,
  Provider,
  type TransactionRequestLike,
  type Version,
  Wallet,
  type WalletUnlocked,
} from 'fuels';
import { PredicateAccount } from './Predicate';
import { BETA_5_URL } from './constants';
import type { BurnerWalletConnectorConfig } from './types';
import { BURNER_WALLET_ICON } from './utils/burner-wallet-icon';
import { predicates } from './utils/predicateResources';

export class BurnerWalletConnector extends FuelConnector {
  name = 'Burner Wallet';
  metadata: ConnectorMetadata = {
    image: BURNER_WALLET_ICON,
    install: {
      action: 'Install',
      description: 'Install Burner Wallet to connect to Fuel',
      link: '',
    },
  };

  installed = true;
  connected = false;

  // ethProvider: unknown | null = null;
  fuelProvider: Provider | null = null;
  burnerWalletProvider: Provider | null = null;

  burnerWallet: WalletUnlocked | null = null;

  events = {
    ...FuelConnectorEventTypes,
    // ...EVMWalletConnectorEvents,
  };

  private predicateAccount: PredicateAccount;
  private predicate = predicates['verification-predicate'];
  private setupLock = false;
  private _currentAccount: string | null = null;
  private config: BurnerWalletConnectorConfig = {};
  private _ethereumEvents = 0;

  constructor(config: BurnerWalletConnectorConfig = {}) {
    super();

    this.predicateAccount = new PredicateAccount();

    this.configProviders(config);
  }

  async configProviders(config: BurnerWalletConnectorConfig = {}) {
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || Provider.create(BETA_5_URL),
      burnerWalletProvider: config.burnerWalletProvider || null,
    });
  }

  getLazyBurnerWallet() {
    const burnerWalletPrivateKey = sessionStorage.getItem(
      'burnerWalletPrivateKey',
    );

    if (!burnerWalletPrivateKey) {
      const wallet = Wallet.generate();

      sessionStorage.setItem('burnerWalletPrivateKey', wallet.privateKey);
      this.burnerWallet = wallet;

      return this.burnerWallet.provider;
    }

    this.burnerWallet = Wallet.fromPrivateKey(burnerWalletPrivateKey);

    return this.burnerWallet.provider;
  }

  /**
   * ============================================================
   * Application communication methods
   * ============================================================
   */
  async getProviders() {
    if (!this.fuelProvider || !this.burnerWalletProvider) {
      this.burnerWalletProvider = this.getLazyBurnerWallet();

      if (!this.burnerWalletProvider) {
        throw new Error('Burner wallet provider not found');
      }

      this.fuelProvider = (await this.config.fuelProvider) ?? null;

      if (!this.fuelProvider) {
        throw new Error('Fuel provider not found');
      }
    }

    return {
      fuelProvider: this.fuelProvider,
      burnerWalletProvider: this.burnerWalletProvider,
    };
  }

  async setup() {
    if (this.setupLock) return;
    this.setupLock = true;

    await this.setupCurrentAccount();
    // await this.setupEventBridge();
  }

  // async setupEventBridge() {
  //   const { burnerWalletProvider } = await this.getProviders();

  //   burnerWalletProvider.on(this.events.ACCOUNTS_CHANGED, async (accounts) => {
  //     this.emit('accounts', await this.accounts());
  //     if (this._currentAccount !== accounts[0]) {
  //       await this.setupCurrentAccount();
  //     }
  //   });

  //   burnerWalletProvider.on(this.events.CONNECT, async (_arg) => {
  //     this.emit('connection', await this.isConnected());
  //   });

  //   burnerWalletProvider.on(this.events.DISCONNECT, async (_arg) => {
  //     this.emit('connection', await this.isConnected());
  //   });
  // }

  async setupCurrentAccount() {
    const currentAccount = this.burnerWallet?.address.toString() ?? null;

    this._currentAccount = currentAccount;
    this.emit('currentAccount', currentAccount);
  }

  /**
   * ============================================================
   * Connector methods
   * ============================================================
   */

  async ping(): Promise<boolean> {
    await this.configProviders();

    return true;
  }

  async version(): Promise<Version> {
    return { app: '0.0.0', network: '0.0.0' };
  }

  async isConnected(): Promise<boolean> {
    const account = this.burnerWallet?.address.toString();

    return !!account;
  }

  async accounts(): Promise<Array<string>> {
    if (!this.burnerWalletProvider) {
      return [];
    }

    const accounts = await this.predicateAccount.getPredicateAccounts(
      this.burnerWallet as WalletUnlocked,
    );

    return accounts.map((account) => account.predicateAccount);
  }

  async connect(): Promise<boolean> {
    if (!(await this.isConnected())) {
      this.burnerWallet?.connect(this.burnerWalletProvider as Provider);

      this.emit(this.events.connection, true);

      this.on(this.events.connection, (connection: boolean) => {
        this.connected = connection;
      });

      return true;
    }

    return this.connected;
  }

  async disconnect(): Promise<boolean> {
    this.burnerWallet?.lock();

    this.emit(this.events.connection, false);
    this.emit(this.events.accounts, []);
    this.emit(this.events.currentAccount, null);

    return false;
  }

  async signMessage(_address: string, _message: string): Promise<string> {
    throw new Error('A predicate account cannot sign messages');
  }

  async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<string> {
    console.log({ address, transaction });

    return '';
  }

  async currentAccount(): Promise<string | null> {
    if (!(await this.isConnected())) {
      throw Error('No connected accounts');
    }

    const account = this.burnerWallet?.address.toString();

    if (!account) {
      throw Error('No connected accounts');
    }

    return account;
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
    const { fuelProvider } = await this.getProviders();
    const chainId = fuelProvider.getChainId();

    return { url: fuelProvider.url, chainId: chainId };
  }

  async addAbi(_abiMap: AbiMap): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async getAbi(_contractId: string): Promise<JsonAbi> {
    throw Error('Cannot get contractId ABI for a predicate');
  }

  async hasAbi(_contractId: string): Promise<boolean> {
    throw Error('A predicate account cannot have an ABI');
  }
}
