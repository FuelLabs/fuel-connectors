import { hexToBytes } from '@ethereumjs/util';
// External libraries
import { hexlify, splitSignature } from '@ethersproject/bytes';

import {
  CHAIN_IDS,
  type ConnectorMetadata,
  FuelConnectorEventType,
  FuelConnectorEventTypes,
  Provider,
  type TransactionRequestLike,
} from 'fuels';

import {
  EthereumWalletAdapter,
  type Maybe,
  type MaybeAsync,
  PredicateConnector,
  type PredicateVersion,
  type PredicateWalletAdapter,
  type ProviderDictionary,
  getMockedSignatureIndex,
  getOrThrow,
  getProviderUrl,
} from '@fuel-connectors/common';
import {
  type EvmPredicateRoot,
  PREDICATE_VERSIONS,
  txIdEncoders,
} from '@fuel-connectors/evm-predicates';
import { METAMASK_ICON, WINDOW } from './constants';
import {
  type EIP1193Provider,
  type EVMWalletConnectorConfig,
  EVMWalletConnectorEvents,
} from './types';

export class EVMWalletConnector extends PredicateConnector {
  name = 'Metamask';
  metadata: ConnectorMetadata = {
    image: METAMASK_ICON,
    install: {
      action: 'Install',
      description: 'Install Metamask Wallet to connect to Fuel',
      link: 'https://metamask.io/download/',
    },
  };
  ethProvider: EIP1193Provider | null = null;
  fuelProvider: Provider | null = null;
  events = {
    ...FuelConnectorEventTypes,
    ...EVMWalletConnectorEvents,
  };

  private setupLock = false;
  private _currentAccount: string | null = null;
  private config: EVMWalletConnectorConfig = {};
  private _ethereumEvents = 0;

  constructor(config: EVMWalletConnectorConfig = {}) {
    super();

    this.customPredicate = config.predicateConfig || null;

    this.configProviders(config);
    this.setUpEvents();
  }

  private async getLazyEthereum() {
    if (this.config.ethProvider) {
      return this.config.ethProvider;
    }
    if (WINDOW?.ethereum) {
      return WINDOW.ethereum;
    }

    return null;
  }

  private setUpEvents() {
    this._ethereumEvents = Number(
      setInterval(() => {
        if (WINDOW?.ethereum) {
          clearInterval(this._ethereumEvents);
          WINDOW.dispatchEvent(
            new CustomEvent(FuelConnectorEventType, { detail: this }),
          );
        }
      }, 500),
    );
  }

  private async setup() {
    if (this.setupLock) return;
    this.setupLock = true;

    await this.setupCurrentAccount();
    await this.setupEventBridge();
  }

  private async setupEventBridge() {
    const { ethProvider } = await this.getProviders();

    ethProvider?.on(this.events.ACCOUNTS_CHANGED, async (accounts) => {
      this.emit('accounts', await this.accounts());
      if (this._currentAccount !== accounts[0]) {
        await this.setupCurrentAccount();
        await this.setupPredicate();
      }
    });

    ethProvider?.on(this.events.CONNECT, async (_arg) => {
      await this.setupPredicate();
      this.emit('connection', await this.isConnected());
    });

    ethProvider?.on(this.events.DISCONNECT, async (_arg) => {
      this.emit('connection', await this.isConnected());
    });
  }

  private async setupCurrentAccount() {
    const [currentAccount = null] = await this.accounts();
    await this.setupPredicate();
    this._currentAccount = currentAccount;
    this.emit('currentAccount', currentAccount);
  }

  protected getWalletAdapter(): PredicateWalletAdapter {
    return new EthereumWalletAdapter();
  }

  protected getPredicateVersions(): Record<string, PredicateVersion> {
    return PREDICATE_VERSIONS;
  }

  protected requireConnection(): MaybeAsync<void> {}

  protected async configProviders(config: EVMWalletConnectorConfig = {}) {
    const network = getProviderUrl(config.chainId ?? CHAIN_IDS.fuel.mainnet);
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || Provider.create(network),
      ethProvider: config.ethProvider || WINDOW?.ethereum,
    });
  }

  protected async walletAccounts(): Promise<Array<string>> {
    const { ethProvider } = await this.getProviders();

    const accounts = await ethProvider?.request({
      method: 'eth_accounts',
    });

    return accounts as Array<string>;
  }

  protected async getAccountAddress(): Promise<Maybe<string>> {
    return (await this.walletAccounts())[0];
  }

  protected async getProviders(): Promise<ProviderDictionary> {
    if (!this.fuelProvider || !this.ethProvider) {
      this.ethProvider = getOrThrow(
        await this.getLazyEthereum(),
        'Ethereum provider not found',
      );

      this.fuelProvider = getOrThrow(
        await this.config.fuelProvider,
        'Fuel provider not found',
      );
    }

    return {
      fuelProvider: this.fuelProvider,
      ethProvider: this.ethProvider,
    };
  }

  public async ping(): Promise<boolean> {
    await Promise.all([
      this.getProviders(),
      this.setup(),
      this.setupPredicate(),
    ]);

    return true;
  }

  public async connect(): Promise<boolean> {
    if (!(await this.isConnected())) {
      const { ethProvider } = await this.getProviders();

      await ethProvider?.request({
        method: 'wallet_requestPermissions',
        params: [
          {
            eth_accounts: {},
          },
        ],
      });

      await this.setupPredicate();
      this.emit(this.events.connection, true);

      return true;
    }

    return this.connected;
  }

  public async disconnect(): Promise<boolean> {
    if (await this.isConnected()) {
      const { ethProvider } = await this.getProviders();

      await ethProvider?.request({
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

  public async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<string> {
    const { ethProvider, fuelProvider } = await this.getProviders();
    const { request, transactionId, account, transactionRequest } =
      await this.prepareTransaction(address, transaction);

    const txId = this.encodeTxId(transactionId);
    const signature = (await ethProvider?.request({
      method: 'personal_sign',
      params: [txId, account],
    })) as string;

    const predicateSignatureIndex = getMockedSignatureIndex(
      transactionRequest.witnesses,
    );

    // Transform the signature into compact form for Sway to understand
    const compactSignature = splitSignature(hexToBytes(signature)).compact;
    transactionRequest.witnesses[predicateSignatureIndex] = compactSignature;

    const transactionWithPredicateEstimated =
      await fuelProvider.estimatePredicates(request);

    const response = await fuelProvider.operations.submit({
      encodedTransaction: hexlify(
        transactionWithPredicateEstimated.toTransactionBytes(),
      ),
    });

    return response.submit.id;
  }

  async signMessageCustomCurve(message: string) {
    const { ethProvider } = await this.getProviders();
    if (!ethProvider) throw new Error('Eth provider not found');
    const accountAddress = await this.getAccountAddress();
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

  private isValidPredicateAddress(
    address: string,
  ): address is EvmPredicateRoot {
    return address in txIdEncoders;
  }

  private encodeTxId(txId: string): string {
    if (!this.isValidPredicateAddress(this.predicateAddress)) {
      return txId;
    }

    const encoder = txIdEncoders[this.predicateAddress];
    return encoder.encodeTxId(txId);
  }
}
