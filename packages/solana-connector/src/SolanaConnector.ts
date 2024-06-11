import type { Web3Modal } from '@web3modal/solana';
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
  hexlify,
  transactionRequestify,
} from 'fuels';
import { SOLANA_ICON, TESTNET_URL } from './constants';
import { predicates } from './generated/predicate';
import type { SolanaConfig } from './types';
import { PredicateAccount } from './utils/Predicate';
import { createSolanaProvider } from './utils/solanaProvider';

export class SolanaConnector extends FuelConnector {
  name = 'Solana Wallets';
  connected = false;
  installed = false;

  events = FuelConnectorEventTypes;

  metadata: ConnectorMetadata = {
    image: SOLANA_ICON,
    install: {
      action: 'Install',
      description: 'Install Solana Wallet to connect to Fuel',
      link: 'https://solana.com/ecosystem/explore?categories=wallet',
    },
  };

  web3Modal: Web3Modal;
  fuelProvider: FuelProvider | null = null;
  predicateAddress: string | null = null;

  private predicateAccount: PredicateAccount;
  private config: SolanaConfig = {};
  private encoder = new TextEncoder();

  constructor(config: SolanaConfig = {}) {
    super();

    this.predicateAccount = new PredicateAccount(
      config.predicateConfig ?? predicates['verification-predicate'],
    );

    const { walletConnectModal } = createSolanaProvider(config);
    this.web3Modal = walletConnectModal;

    this.configProviders(config);
    this.setupWatchers();
  }

  async configProviders(config: SolanaConfig = {}) {
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || FuelProvider.create(TESTNET_URL),
    });
  }

  /**
   * ============================================================
   * Application communication methods
   * ============================================================
   */
  svmAccounts(): Array<string> {
    if (!this.web3Modal) {
      return [];
    }

    const account = this.web3Modal.getAddress();

    return account ? [account] : [];
  }

  setupWatchers() {
    this.web3Modal.subscribeEvents((event) => {
      console.log(event.data.event);

      switch (event.data.event) {
        case 'CONNECT_SUCCESS': {
          console.log(
            '>>>>> CONNECT_SUCCESS',
            this.predicateAccount.getPredicateAddress(
              this.web3Modal.getAddress() ?? '',
            ),
          );

          this.emit(this.events.connection, true);
          this.emit(
            this.events.currentAccount,
            this.predicateAccount.getPredicateAddress(
              this.web3Modal.getAddress() ?? '',
            ),
          );
          this.emit(
            this.events.accounts,
            this.predicateAccount.getPredicateAccounts(this.svmAccounts()),
          );
          break;
        }
        case 'DISCONNECT_SUCCESS': {
          this.emit(this.events.connection, false);
          this.emit(this.events.currentAccount, null);
          this.emit(this.events.accounts, []);
          break;
        }
      }
    });
  }

  async getProviders() {
    if (!this.fuelProvider) {
      this.fuelProvider = (await this.config.fuelProvider) ?? null;

      if (!this.fuelProvider) {
        throw new Error('Fuel provider not found');
      }
    }

    return {
      fuelProvider: this.fuelProvider,
    };
  }

  //TODO - Implement
  async requireConnection() {}

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
    await this.requireConnection();
    const accounts = this.svmAccounts();

    return accounts.length > 0;
  }

  async connect(): Promise<boolean> {
    //@ts-ignore
    if (this.web3Modal.getIsConnectedState()) {
      this.emit(this.events.connection, true);
      this.emit(
        this.events.currentAccount,
        this.predicateAccount.getPredicateAddress(
          this.web3Modal.getAddress() ?? '',
        ),
      );
      this.emit(
        this.events.accounts,
        this.predicateAccount.getPredicateAccounts(this.svmAccounts()),
      );

      return true;
    }

    return new Promise((resolve) => {
      this.web3Modal.open();
      const unsub = this.web3Modal.subscribeEvents(async (event) => {
        switch (event.data.event) {
          case 'CONNECT_SUCCESS': {
            resolve(true);
            unsub();
            break;
          }
          case 'MODAL_CLOSE':
          case 'CONNECT_ERROR': {
            resolve(false);
            unsub();
            break;
          }
        }
      });
    });
  }

  async disconnect(): Promise<boolean> {
    this.web3Modal.disconnect();

    this.emit(this.events.connection, false);
    this.emit(this.events.accounts, []);
    this.emit(this.events.currentAccount, null);

    return this.isConnected();
  }

  async accounts(): Promise<string[]> {
    await this.requireConnection();

    const accounts = this.predicateAccount.getPredicateAccounts(
      this.svmAccounts(),
    );

    return accounts;
  }

  async signMessage(_address: string, _message: string): Promise<string> {
    throw new Error('A predicate account cannot sign messages.');
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
    const svmAccount = this.predicateAccount.getSVMAddress(
      address,
      this.svmAccounts(),
    );

    if (!svmAccount) {
      throw new Error(`No account found for ${address}`);
    }

    const transactionRequest = transactionRequestify(transaction);

    // Create a predicate and set the witness index to call in the predicate
    const predicate = this.predicateAccount.createPredicate(
      svmAccount,
      fuelProvider,
    );

    // Attach missing inputs (including estimated predicate gas usage) / outputs to the request
    await predicate.provider.estimateTxDependencies(transactionRequest);

    predicate.connect(fuelProvider);

    // To each input of the request, attach the predicate and its data
    const requestWithPredicateAttached =
      predicate.populateTransactionPredicateData(transactionRequest);

    const txId = requestWithPredicateAttached.getTransactionId(chainId);
    const u8TxId = this.encoder.encode(txId);

    const signedMessage = await this.web3Modal
      .getWalletProvider()
      //@ts-ignore
      ?.signMessage(u8TxId, 'utf8');

    const signature = hexlify(signedMessage);
    transactionRequest.witnesses.push(signature);

    await predicate.provider.estimatePredicates(transactionRequest);

    const response = await predicate.sendTransaction(transactionRequest);

    return response.id;
  }

  async currentAccount(): Promise<string | null> {
    if (!(await this.isConnected())) {
      throw Error('No connected accounts');
    }

    const svmAccount = this.web3Modal.getAddress();

    if (!svmAccount) {
      throw Error('No Solana account selected');
    }

    const currentAccount =
      this.predicateAccount.getPredicateAddress(svmAccount);

    return currentAccount;
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
