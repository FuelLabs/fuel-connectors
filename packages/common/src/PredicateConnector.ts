import {
  type AbiMap,
  type Asset,
  type ConnectorMetadata,
  FuelConnector,
  FuelConnectorEventTypes,
  type Predicate as FuelPredicate,
  type Provider as FuelProvider,
  type InputValue,
  type JsonAbi,
  type Network,
  type TransactionRequest,
  type TransactionRequestLike,
  type Version,
  ZeroBytes32,
  bn,
  calculateGasFee,
  concat,
  transactionRequestify,
} from 'fuels';

import {
  PredicateFactory,
  type PredicateInput,
  getSignatureIndex,
} from './PredicateFactory';
import type { PredicateWalletAdapter } from './PredicateWalletAdapter';
import type {
  EIP1193Provider,
  Maybe,
  MaybeAsync,
  Option,
  Predicate,
} from './types';

export type ConnectorConfig = {
  [key: string]: unknown;
  predicateConfig?: PredicateInput;
};

export type ProviderDictionary = {
  fuelProvider: FuelProvider;
  ethProvider?: EIP1193Provider;
  [key: string]: Maybe<Option<FuelProvider, EIP1193Provider>>;
};

export type PreparedTransaction = {
  predicate: FuelPredicate<InputValue[]>;
  request: TransactionRequest;
  transactionId: string;
  account: string;
  transactionRequest: TransactionRequest;
};

export abstract class PredicateConnector extends FuelConnector {
  public abstract name: string;
  public abstract metadata: ConnectorMetadata;
  public connected = false;
  public installed = false;
  public events = FuelConnectorEventTypes;

  protected predicateAddress: Maybe<string> = null;
  protected customPredicate: Maybe<PredicateInput>;
  protected predicateAccount: Maybe<PredicateFactory> = null;
  protected subscriptions: Array<() => void> = [];

  protected abstract configProviders(config: ConnectorConfig): MaybeAsync<void>;
  protected abstract getWalletAdapter(): PredicateWalletAdapter;
  protected abstract getPredicateVersions(): Record<string, Predicate>;
  protected abstract getAccountAddress(): MaybeAsync<Maybe<string>>;
  protected abstract getProviders(): MaybeAsync<ProviderDictionary>;
  protected abstract requireConnection(): MaybeAsync<void>;
  protected abstract walletAccounts(): Promise<Array<string>>;

  public abstract sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<string>;
  public abstract connect(): Promise<boolean>;
  public abstract disconnect(): Promise<boolean>;

  protected async setupPredicate(): Promise<PredicateFactory> {
    if (this.customPredicate?.abi && this.customPredicate?.bytecode) {
      this.predicateAccount = new PredicateFactory(
        this.getWalletAdapter(),
        this.customPredicate,
      );
      this.predicateAddress = 'custom';

      return this.predicateAccount;
    }

    const predicateVersions = Object.entries(this.getPredicateVersions()).map(
      ([key, pred]) => ({
        pred,
        key,
      }),
    );

    let predicateWithBalance: Predicate | null = null;

    for (const predicateVersion of predicateVersions) {
      const predicateInstance = new PredicateFactory(this.getWalletAdapter(), {
        abi: predicateVersion.pred.predicate.abi,
        bytecode: predicateVersion.pred.predicate.bytecode,
      });

      const address = await this.getAccountAddress();
      if (!address) {
        continue;
      }

      const { fuelProvider } = await this.getProviders();
      const predicate = predicateInstance.build(address, fuelProvider, [1]);

      const balance = await predicate.getBalance();

      if (balance.toString() !== bn(0).toString()) {
        predicateWithBalance = predicateVersion.pred;
        this.predicateAddress = predicateVersion.key;
        break;
      }
    }

    if (predicateWithBalance) {
      this.predicateAccount = new PredicateFactory(this.getWalletAdapter(), {
        abi: predicateWithBalance.predicate.abi,
        bytecode: predicateWithBalance.predicate.bytecode,
      });

      return this.predicateAccount;
    }

    const newestPredicate = predicateVersions.sort(
      (a, b) => Number(b.pred.generatedAt) - Number(a.pred.generatedAt),
    )[0];

    if (newestPredicate) {
      this.predicateAccount = new PredicateFactory(this.getWalletAdapter(), {
        abi: newestPredicate.pred.predicate.abi,
        bytecode: newestPredicate.pred.predicate.bytecode,
      });
      this.predicateAddress = newestPredicate.key;

      return this.predicateAccount;
    }

    throw new Error('No predicate found');
  }

  protected subscribe(listener: () => void) {
    this.subscriptions.push(listener);
  }

  protected async prepareTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<PreparedTransaction> {
    if (!(await this.isConnected())) {
      throw Error('No connected accounts');
    }

    if (!this.predicateAccount) {
      throw Error('No predicate account found');
    }

    const { fuelProvider } = await this.getProviders();
    const chainId = fuelProvider.getChainId();
    const walletAccount = this.predicateAccount.getAccountAddress(
      address,
      await this.walletAccounts(),
    );
    if (!walletAccount) {
      throw Error(`No account found for ${address}`);
    }
    const transactionRequest = transactionRequestify(transaction);
    const transactionFee = transactionRequest.maxFee.toNumber();
    const predicateSignatureIndex = getSignatureIndex(
      transactionRequest.witnesses,
    );

    // Create a predicate and set the witness index to call in predicate`
    const predicate = this.predicateAccount.build(walletAccount, fuelProvider, [
      predicateSignatureIndex,
    ]);
    predicate.connect(fuelProvider);

    // To each input of the request, attach the predicate and its data
    const requestWithPredicateAttached =
      predicate.populateTransactionPredicateData(transactionRequest);

    const maxGasUsed =
      await this.predicateAccount.getMaxPredicateGasUsed(fuelProvider);

    let predictedGasUsedPredicate = bn(0);
    requestWithPredicateAttached.inputs.forEach((input) => {
      if ('predicate' in input && input.predicate) {
        input.witnessIndex = 0;
        predictedGasUsedPredicate = predictedGasUsedPredicate.add(maxGasUsed);
      }
    });

    // Add a placeholder for the predicate signature to count on bytes measurement from start. It will be replaced later
    requestWithPredicateAttached.witnesses[predicateSignatureIndex] = concat([
      ZeroBytes32,
      ZeroBytes32,
    ]);

    const { gasPriceFactor } = predicate.provider.getGasConfig();
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

    return {
      predicate,
      request: requestWithPredicateAttached,
      transactionId: requestWithPredicateAttached.getTransactionId(chainId),
      account: walletAccount,
      transactionRequest,
    };
  }

  public clearSubscriptions() {
    if (!this.subscriptions) {
      return;
    }
    this.subscriptions.forEach((listener) => listener());
    this.subscriptions = [];
  }

  public async ping(): Promise<boolean> {
    await this.getProviders();
    return true;
  }

  public async version(): Promise<Version> {
    return { app: '0.0.0', network: '0.0.0' };
  }

  public async isConnected(): Promise<boolean> {
    await this.requireConnection();
    const accounts = await this.accounts();
    return accounts.length > 0;
  }

  public async accounts(): Promise<Array<string>> {
    if (!this.predicateAccount) {
      return [];
    }

    const accs = await this.walletAccounts();
    return this.predicateAccount.getPredicateAddresses(accs);
  }

  public async currentAccount(): Promise<string | null> {
    if (!(await this.isConnected())) {
      throw Error('No connected accounts');
    }
    if (!this.predicateAccount) {
      throw Error('No predicate account found');
    }

    const account = await this.getAccountAddress();
    return account ? this.predicateAccount.getPredicateAddress(account) : null;
  }

  public async networks(): Promise<Network[]> {
    return [await this.currentNetwork()];
  }

  public async currentNetwork(): Promise<Network> {
    const { fuelProvider } = await this.getProviders();
    const chainId = fuelProvider.getChainId();

    return { url: fuelProvider.url, chainId: chainId };
  }

  public async signMessage(
    _address: string,
    _message: string,
  ): Promise<string> {
    throw new Error('A predicate account cannot sign messages');
  }

  public async addAssets(_assets: Asset[]): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async addAsset(_asset: Asset): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async assets(): Promise<Array<Asset>> {
    return [];
  }

  public async addNetwork(_networkUrl: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async selectNetwork(_network: Network): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async addAbi(_abiMap: AbiMap): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async getAbi(_contractId: string): Promise<JsonAbi> {
    throw Error('Cannot get contractId ABI for a predicate');
  }

  public async hasAbi(_contractId: string): Promise<boolean> {
    throw Error('A predicate account cannot have an ABI');
  }
}
