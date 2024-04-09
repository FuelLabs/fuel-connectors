import { hexToBytes } from '@ethereumjs/util';
import { hexlify, splitSignature } from '@ethersproject/bytes';
import { type Config, getAccount } from '@wagmi/core';
import type { Web3Modal } from '@web3modal/wagmi';
import {
  type AbiMap,
  type Asset,
  type ConnectorMetadata,
  FuelConnector,
  FuelConnectorEventTypes,
  Provider as FuelProvider,
  type JsonAbi,
  type Network,
  type TransactionRequestLike,
  type Version,
  transactionRequestify,
} from 'fuels';
import { PredicateAccount } from './Predicate';
import { BETA_5_URL } from './constants';
import {
  type EthereumWalletConnectorConfig,
  EthereumWalletConnectorEvents,
} from './types';
import { ETHEREUM_ICON } from './utils/ethereum-icon';
import { createPredicate } from './utils/predicate';
import { predicates } from './utils/predicateResources';
import WagmiConfig from './utils/wagmiConfig';

export class WalletconnectWalletConnector extends FuelConnector {
  name = 'Ethereum Wallets';

  connected = false;
  installed = false;

  events = { ...FuelConnectorEventTypes, ...EthereumWalletConnectorEvents };

  metadata: ConnectorMetadata = {
    image: ETHEREUM_ICON,
    install: {
      action: 'Install',
      description: 'Install Ethereum Wallet to connect to Fuel',
      link: 'https://ethereum.org/en/wallets/find-wallet/',
    },
  };

  ethConfig: Config;
  ethProvider: unknown | null = null;
  fuelProvider: FuelProvider | null = null;
  ethModal: Web3Modal;

  private predicateAccount: PredicateAccount;
  private predicate = predicates['verification-predicate'];
  private setupLock = false;
  private _currentAccount: string | null = null;
  private config: EthereumWalletConnectorConfig = {};
  private _ethereumEvents = 0;

  constructor(config: EthereumWalletConnectorConfig = {}) {
    super();

    this.predicateAccount = new PredicateAccount();

    const wagmiConfig = new WagmiConfig();

    this.ethConfig = wagmiConfig.getEthConfig();
    this.ethModal = wagmiConfig.getEthModal();

    this.configProviders(config);
    this.setupEthereumEvents();
  }

  async configProviders(config: EthereumWalletConnectorConfig = {}) {
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || FuelProvider.create(BETA_5_URL),
      ethProvider: config.ethProvider || null,
    });
  }

  setupEthereumEvents() {
    this._ethereumEvents = Number(
      setInterval(() => {
        if (this.ethProvider) {
          clearInterval(this._ethereumEvents);
          window.dispatchEvent(
            new CustomEvent('FuelConnector', { detail: this }),
          );
        }
      }, 500),
    );
  }

  /**
   * ============================================================
   * Application communication methods
   * ============================================================
   */

  async getProviders() {
    if (!this.fuelProvider || !this.ethProvider) {
      this.fuelProvider = (await this.config.fuelProvider) ?? null;

      if (!this.fuelProvider) {
        throw new Error('Fuel provider not found');
      }
    }

    return {
      fuelProvider: this.fuelProvider,
    };
  }

  async setup() {
    if (this.setupLock) return;
    this.setupLock = true;

    await this.setupCurrentAccount();
    await this.setupEventBridge();
  }

  async setupEventBridge() {
    //@ts-ignore
    this.ethProvider.on(this.events.ACCOUNTS_CHANGED, async (accounts) => {
      this.emit('accounts', await this.accounts());
      if (this._currentAccount !== accounts[0]) {
        await this.setupCurrentAccount();
      }
    });

    //@ts-ignore
    this.ethProvider.on(this.events.CONNECT, async (_arg) => {
      this.emit('connection', await this.isConnected());
    });

    //@ts-ignore
    this.ethProvider.on(this.events.DISCONNECT, async (_arg) => {
      this.emit('connection', await this.isConnected());
    });
  }

  async setupCurrentAccount() {
    const [currentAccount = null] = await this.accounts();

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
    const accounts = await this.accounts();

    return accounts.length > 0;
  }

  async accounts(): Promise<Array<string>> {
    if (!this.ethProvider) {
      return [];
    }

    const accounts =
      //@ts-ignore
      await this.predicateAccount.getPredicateAccounts(this.ethProvider);

    return accounts.map((account) => account.predicateAccount);
  }

  async connect(): Promise<boolean> {
    if (!(await this.isConnected())) {
      await this.ethModal?.open();

      this.ethModal?.subscribeEvents(async (event) => {
        if (event.data.event === 'CONNECT_SUCCESS') {
          this.ethProvider = await getAccount(
            this.ethConfig,
          ).connector?.getProvider();

          await this.setup();

          this.emit(this.events.connection, true);

          this.on(this.events.connection, (connection: boolean) => {
            this.connected = connection;
          });
        }
      });

      return true;
    }

    return this.connected;
  }

  async disconnect(): Promise<boolean> {
    this.ethProvider = null;

    this.emit(this.events.connection, false);
    this.emit(this.events.accounts, []);
    this.emit(this.events.currentAccount, null);

    await getAccount(this.ethConfig as Config).connector?.disconnect();

    location.reload();

    return false;
  }

  async signMessage(_address: string, _message: string): Promise<string> {
    throw new Error('A predicate account cannot sign messages');
  }

  async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<string> {
    if (!(await this.isConnected())) {
      throw Error('No connected accounts');
    }

    const { fuelProvider } = await this.getProviders();
    const chainId = fuelProvider.getChainId();
    const account = await this.predicateAccount.getPredicateFromAddress(
      address,
      //@ts-ignore
      this.ethProvider,
    );
    if (!account) {
      throw Error(`No account found for ${address}`);
    }
    const transactionRequest = transactionRequestify(transaction);

    // Create a predicate and set the witness index to call in predicate`
    const predicate = createPredicate(
      account.ethAccount,
      fuelProvider,
      this.predicate.bytecode,
      this.predicate.abi,
      [transactionRequest.witnesses.length],
    );
    predicate.connect(fuelProvider);

    // Attach missing inputs (including estimated predicate gas usage) / outputs to the request
    await predicate.provider.estimateTxDependencies(transactionRequest);

    // To each input of the request, attach the predicate and its data
    const requestWithPredicateAttached =
      predicate.populateTransactionPredicateData(transactionRequest);

    const txID = requestWithPredicateAttached.getTransactionId(chainId);
    //@ts-ignore
    const signature = await this.ethProvider.request({
      method: 'personal_sign',
      params: [txID, account.ethAccount],
    });

    // Transform the signature into compact form for Sway to understand
    const compactSignature = splitSignature(hexToBytes(signature)).compact;
    transactionRequest.witnesses.push(compactSignature);

    const transactionWithPredicateEstimated =
      await fuelProvider.estimatePredicates(requestWithPredicateAttached);

    const response = await fuelProvider.operations.submit({
      encodedTransaction: hexlify(
        transactionWithPredicateEstimated.toTransactionBytes(),
      ),
    });

    return response.submit.id;
  }

  async currentAccount(): Promise<string | null> {
    if (!(await this.isConnected())) {
      throw Error('No connected accounts');
    }

    const account = getAccount(this.ethConfig).address;

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
