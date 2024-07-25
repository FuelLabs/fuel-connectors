import { ApiController } from '@web3modal/core';
import type { Web3Modal } from '@web3modal/solana';
import type { Provider } from '@web3modal/solana/dist/types/src/utils/scaffold';
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
  ZeroBytes32,
  bn,
  calculateGasFee,
  concat,
  transactionRequestify,
} from 'fuels';
import { SOLANA_ICON, TESTNET_URL } from './constants';
import { predicates } from './generated/predicate';
import type { Maybe, SolanaConfig } from './types';
import { PredicateAccount } from './utils/Predicate';
import { createSolanaConfig } from './utils/solanaConfig';
import { createSolanaWeb3ModalInstance } from './utils/web3Modal';
import { getSignatureIndex } from './utils/witness';

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

  web3Modal!: Web3Modal;
  fuelProvider: FuelProvider | null = null;
  predicateAddress: string | null = null;

  private predicateAccount: PredicateAccount;
  private config: SolanaConfig = {} as SolanaConfig;
  private svmAddress: string | null = null;
  private subscriptions: Array<() => void> = [];

  constructor(config: SolanaConfig) {
    super();
    this.configProviders(config);
    this.predicateAccount = new PredicateAccount(
      config.predicateConfig ?? predicates['verification-predicate'],
    );
  }

  modalFactory(config?: SolanaConfig) {
    const solanaConfig = createSolanaConfig(config?.projectId);

    return createSolanaWeb3ModalInstance({
      projectId: config?.projectId,
      solanaConfig,
    });
  }

  // createModal re-instanciates the modal to update singletons from web3modal
  createModal() {
    this.destroy();
    const web3Modal = this.modalFactory(this.config);
    this.web3Modal = web3Modal;
    ApiController.prefetch();
    this.setupWatchers();
  }

  providerFactory(config?: SolanaConfig) {
    return config?.fuelProvider || FuelProvider.create(TESTNET_URL);
  }
  configProviders(config: SolanaConfig) {
    this.config = Object.assign(config, {
      fuelProvider: this.providerFactory(config),
    });
  }

  destroy() {
    this.subscriptions.forEach((unsub) => unsub());
    this.subscriptions = [];
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

  // Solana Web3Modal is Canary and not yet stable
  // It shares the same events as WalletConnect, hence validations must be made in order to avoid running connections with EVM Addresses instead of Solana Addresses
  setupWatchers() {
    this.subscriptions.push(
      this.web3Modal.subscribeEvents((event) => {
        switch (event.data.event) {
          case 'CONNECT_SUCCESS': {
            const address = this.web3Modal.getAddress() || '';

            if (!address || address.startsWith('0x')) {
              return;
            }
            this.emit(this.events.connection, true);
            this.emit(
              this.events.currentAccount,
              this.predicateAccount.getPredicateAddress(address),
            );
            this.emit(
              this.events.accounts,
              this.predicateAccount.getPredicateAccounts(this.svmAccounts()),
            );
            this.svmAddress = address;
            break;
          }
          case 'DISCONNECT_SUCCESS': {
            this.emit(this.events.connection, false);
            this.emit(this.events.currentAccount, null);
            this.emit(this.events.accounts, []);
            break;
          }
        }
      }),
    );

    // Poll for account changes due a problem with the event listener not firing on account changes
    const interval = setInterval(() => {
      if (!this.web3Modal) {
        return;
      }
      const address = this.web3Modal.getAddress();
      if (address && address !== this.svmAddress) {
        this.emit(this.events.connection, true);
        this.emit(this.events.currentAccount, address);
        this.emit(
          this.events.accounts,
          this.predicateAccount.getPredicateAccounts(this.svmAccounts()),
        );

        this.svmAddress = address;
      }

      if (!address && this.svmAddress) {
        this.emit(this.events.connection, false);
        this.emit(this.events.currentAccount, null);
        this.emit(this.events.accounts, []);

        this.svmAddress = null;
      }
    }, 300);

    this.subscriptions.push(() => clearInterval(interval));
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

  async requireConnection() {
    if (!this.web3Modal) this.createModal();
  }

  /**
   * ============================================================
   * Connector methods
   * ============================================================
   */
  async ping(): Promise<boolean> {
    if (!this.config?.fuelProvider) {
      this.config = Object.assign(this.config, {
        fuelProvider: this.providerFactory(this.config),
      });
    }
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
    this.createModal();

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
    const transactionFee = transactionRequest.maxFee;
    const predicateSignatureIndex = getSignatureIndex(
      transactionRequest.witnesses,
    );

    // Create a predicate and set the witness index to call in the predicate
    const predicate = this.predicateAccount.createPredicate(
      svmAccount,
      fuelProvider,
      [predicateSignatureIndex],
    );

    // Attach missing inputs (including estimated predicate gas usage) / outputs to the request
    await predicate.provider.estimateTxDependencies(transactionRequest);
    predicate.connect(fuelProvider);

    // To each input of the request, attach the predicate and its data
    const requestWithPredicateAttached =
      predicate.populateTransactionPredicateData(transactionRequest);

    const maxGasUsed =
      await this.predicateAccount.getMaxPredicateGasUsed(fuelProvider);
    let predictedGasUsedPredicate = bn(0);
    // @ts-ignore
    requestWithPredicateAttached.inputs.forEach((input) => {
      if ('predicate' in input && input.predicate) {
        input.witnessIndex = 0;
        predictedGasUsedPredicate = predictedGasUsedPredicate.add(maxGasUsed);
      }
    });
    requestWithPredicateAttached.witnesses[predicateSignatureIndex] = concat([
      ZeroBytes32,
      ZeroBytes32,
    ]);
    const { gasPriceFactor } = await predicate.provider.getGasConfig();
    const { maxFee, gasPrice } = await predicate.provider.estimateTxGasAndFee({
      transactionRequest: requestWithPredicateAttached,
    });

    const predicateSuccessFeeDiff = calculateGasFee({
      gas: predictedGasUsedPredicate,
      priceFactor: gasPriceFactor,
      gasPrice,
    });

    const feeWithFat = maxFee.add(predicateSuccessFeeDiff);
    const isNeededFatFee = feeWithFat.gt(transactionFee);

    if (isNeededFatFee) {
      // add more 10 just in case sdk fee estimation is not accurate
      requestWithPredicateAttached.maxFee = feeWithFat.add(10);
    }

    // Attach missing inputs (including estimated predicate gas usage) / outputs to the request
    await predicate.provider.estimateTxDependencies(
      requestWithPredicateAttached,
    );

    // Get transaction id to sign
    const txId = this.predicateAccount.getSmallTxId(
      requestWithPredicateAttached.getTransactionId(chainId),
    );
    const provider: Maybe<Provider> =
      this.web3Modal.getWalletProvider() as Provider;
    if (!provider) {
      throw new Error('No provider found');
    }

    const signedMessage: Uint8Array = (await provider.signMessage(
      txId,
    )) as Uint8Array;
    requestWithPredicateAttached.witnesses[predicateSignatureIndex] =
      signedMessage;

    // Send transaction
    await predicate.provider.estimatePredicates(requestWithPredicateAttached);

    const response = await predicate.sendTransaction(
      requestWithPredicateAttached,
    );

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
