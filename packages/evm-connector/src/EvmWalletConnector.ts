import { hexToBytes } from '@ethereumjs/util';
// External libraries
import { hexlify, splitSignature } from '@ethersproject/bytes';

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
  transactionRequestify,
} from 'fuels';

import { PredicateAccount } from './Predicate';
import { BETA_5_URL, WINDOW } from './constants';
import {
  type EVMWalletConnectorConfig,
  EVMWalletConnectorEvents,
} from './types';
import type { EIP1193Provider } from './utils/eip-1193';
import { METAMASK_ICON } from './utils/metamask-icon';
import { createPredicate, getPredicateAddress } from './utils/predicate';
import { predicates } from './utils/predicateResources';

export class EVMWalletConnector extends FuelConnector {
  name = 'Metamask';
  metadata: ConnectorMetadata = {
    image: METAMASK_ICON,
    install: {
      action: 'Install',
      description: 'Install Metamask Wallet to connect to Fuel',
      link: 'https://metamask.io/download/',
    },
  };

  installed = true;
  connected = false;

  ethProvider: EIP1193Provider | null = null;
  fuelProvider: Provider | null = null;

  events = {
    ...FuelConnectorEventTypes,
    ...EVMWalletConnectorEvents,
  };

  private predicateAccount: PredicateAccount;
  private predicate = predicates['verification-predicate'];
  private setupLock = false;
  private _currentAccount: string | null = null;
  private config: EVMWalletConnectorConfig = {};
  private _ethereumEvents = 0;

  constructor(config: EVMWalletConnectorConfig = {}) {
    super();

    this.predicateAccount = new PredicateAccount();

    this.configProviders(config);
    this.setupEthereumEvents();
  }

  async configProviders(config: EVMWalletConnectorConfig = {}) {
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || Provider.create(BETA_5_URL),
      ethProvider: config.ethProvider || WINDOW?.ethereum,
    });
  }

  setupEthereumEvents() {
    this._ethereumEvents = Number(
      setInterval(() => {
        if (WINDOW?.ethereum) {
          clearInterval(this._ethereumEvents);
          WINDOW.dispatchEvent(
            new CustomEvent('FuelConnector', { detail: this }),
          );
        }
      }, 500),
    );
  }

  async getLazyEthereum() {
    if (this.config.ethProvider) {
      return this.config.ethProvider;
    }
    if (WINDOW?.ethereum) {
      return WINDOW.ethereum;
    }

    return null;
  }

  /**
   * ============================================================
   * Application communication methods
   * ============================================================
   */

  async getProviders() {
    if (!this.fuelProvider || !this.ethProvider) {
      this.ethProvider = await this.getLazyEthereum();

      if (!this.ethProvider) {
        throw new Error('Ethereum provider not found');
      }

      this.fuelProvider = (await this.config.fuelProvider) ?? null;

      if (!this.fuelProvider) {
        throw new Error('Fuel provider not found');
      }
    }

    return { fuelProvider: this.fuelProvider, ethProvider: this.ethProvider };
  }

  async setup() {
    if (this.setupLock) return;
    this.setupLock = true;

    await this.setupCurrentAccount();
    await this.setupEventBridge();
  }

  async setupEventBridge() {
    const { ethProvider } = await this.getProviders();

    ethProvider.on(this.events.ACCOUNTS_CHANGED, async (accounts) => {
      this.emit('accounts', await this.accounts());
      if (this._currentAccount !== accounts[0]) {
        await this.setupCurrentAccount();
      }
    });

    ethProvider.on(this.events.CONNECT, async (_arg) => {
      this.emit('connection', await this.isConnected());
    });

    ethProvider.on(this.events.DISCONNECT, async (_arg) => {
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
    await this.getProviders();
    await this.setup();

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
    const { ethProvider } = await this.getProviders();

    const accounts =
      await this.predicateAccount.getPredicateAccounts(ethProvider);

    return accounts.map((account) => account.predicateAccount);
  }

  async connect(): Promise<boolean> {
    if (!(await this.isConnected())) {
      const { ethProvider } = await this.getProviders();

      await ethProvider.request({
        method: 'wallet_requestPermissions',
        params: [
          {
            eth_accounts: {},
          },
        ],
      });

      this.emit(this.events.connection, true);

      // @ts-ignore
      this.on(this.events.CONNECTION, (connection: boolean) => {
        this.connected = connection;
      });

      return true;
    }

    return this.connected;
  }

  async disconnect(): Promise<boolean> {
    if (await this.isConnected()) {
      const { ethProvider } = await this.getProviders();

      await ethProvider.request({
        method: 'wallet_revokePermissions',
        params: [
          {
            eth_accounts: {},
          },
        ],
      });

      this.emit(this.events.connection, false);
      this.emit(this.events.accounts, []);
      this.emit(this.events.currentAccount, null);
    }

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
    const { ethProvider, fuelProvider } = await this.getProviders();
    const chainId = fuelProvider.getChainId();
    const account = await this.predicateAccount.getPredicateFromAddress(
      address,
      ethProvider,
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

    requestWithPredicateAttached.inputs.forEach((input) => {
      if ('predicate' in input && input.predicate) {
        input.witnessIndex = 0;
      }
    });

    const txID = requestWithPredicateAttached.getTransactionId(chainId);
    const signature = await ethProvider.request({
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

    const { ethProvider } = await this.getProviders();
    const ethAccounts: string[] = await ethProvider.request({
      method: 'eth_accounts',
    });

    const currentEthAccount = ethAccounts[0];

    if (!currentEthAccount) {
      throw new Error('No Ethereum account selected');
    }

    // Eth Wallet (MetaMask at least) return the current select account as the first
    // item in the accounts list.
    const fuelAccount = getPredicateAddress(
      currentEthAccount,
      this.predicate.bytecode,
      this.predicate.abi,
    );

    return fuelAccount;
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
