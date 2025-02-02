import {
  type Maybe,
  PredicateConnector,
  type PredicateVersion,
  type PredicateWalletAdapter,
  type ProviderDictionary,
  SolanaWalletAdapter,
  getFuelPredicateAddresses,
  getMockedSignatureIndex,
  getProviderUrl,
} from '@fuel-connectors/common';
import { PREDICATE_VERSIONS } from '@fuel-connectors/svm-predicates';
import type { Provider as SolanaProvider } from '@reown/appkit-utils/solana';
import {
  CHAIN_IDS,
  type ConnectorMetadata,
  FuelConnectorEventTypes,
  Provider as FuelProvider,
  type TransactionRequestLike,
  hexlify,
  toUtf8Bytes,
} from 'fuels';
import { SOLANA_ICON } from './constants';
import type { PredicateSvmConfig } from './types';
import { type SolanaPredicateRoot, txIdEncoders } from './utils';

export class PredicateSvm extends PredicateConnector {
  name = 'Solana Wallets';
  events = FuelConnectorEventTypes;
  metadata: ConnectorMetadata = {
    image: SOLANA_ICON,
    install: {
      action: 'Install',
      description: 'Install Solana Wallet to connect to Fuel',
      link: 'https://solana.com/ecosystem/explore?categories=wallet',
    },
  };

  private fuelProvider: FuelProvider | Promise<FuelProvider>;
  private config: PredicateSvmConfig;
  private svmAddress: string | null = null;

  constructor(config: PredicateSvmConfig) {
    super();

    this.config = config;
    this.customPredicate = config.predicateConfig || null;
    const network = getProviderUrl(config?.chainId ?? CHAIN_IDS.fuel.mainnet);
    this.fuelProvider = FuelProvider.create(network);

    // Recovering connection
    this.requireConnection();
  }

  private _emitDisconnect() {
    this.emit(this.events.connection, false);
    this.emit(this.events.accounts, []);
    this.emit(this.events.currentAccount, null);
  }

  private async _emitConnected() {
    await this.setupPredicate();
    const address = this.config.appkit.getAddress();
    if (!address || !this.predicateAccount) return;
    this.emit(this.events.connection, true);
    const predicate = this.predicateAccount.getPredicateAddress(address);
    this.emit(this.events.currentAccount, predicate);
    const accounts = await this.walletAccounts();
    const _accounts = this.predicateAccount?.getPredicateAddresses(accounts);
    this.emit(this.events.accounts, _accounts);
  }

  protected requireConnection() {
    this.config.appkit.subscribeAccount((account) => {
      if (this.config.appkit.getActiveChainNamespace() !== 'solana') {
        return;
      }

      // Restablishing connection
      if (
        account.status === 'connected' &&
        account.address &&
        account.address !== this.svmAddress
      ) {
        this.svmAddress = account.address;
        this._emitConnected();
        return;
      }

      // Disconnecting
      if (account.status === 'disconnected' && this.svmAddress) {
        this.svmAddress = null;
        this._emitDisconnect();
        return;
      }
    });
  }

  protected getWalletAdapter(): PredicateWalletAdapter {
    return new SolanaWalletAdapter();
  }

  protected getPredicateVersions(): Record<string, PredicateVersion> {
    return PREDICATE_VERSIONS;
  }

  protected walletAccounts(): Promise<Array<string>> {
    return new Promise((resolve) => {
      const acc = this.config.appkit.getAddress();
      resolve(acc ? [acc] : []);
    });
  }

  protected getAccountAddress(): Maybe<string> {
    return this.config.appkit.getAddress();
  }

  protected async getProviders(): Promise<ProviderDictionary> {
    return {
      fuelProvider: await this.fuelProvider,
    };
  }

  // Watcher will handle everything
  public async connect(): Promise<boolean> {
    return true;
  }

  public async disconnect(): Promise<boolean> {
    await this.config.appkit.disconnect();
    return false;
  }

  private isValidPredicateAddress(
    address: string,
  ): address is SolanaPredicateRoot {
    return address in txIdEncoders;
  }

  private async encodeTxId(txId: string): Promise<Uint8Array> {
    if (!this.isValidPredicateAddress(this.predicateAddress)) {
      throw new Error(`Unknown predicate address ${this.predicateAddress}`);
    }

    const encoder = txIdEncoders[this.predicateAddress];
    return encoder.encodeTxId(txId);
  }

  public async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<string> {
    const { predicate, transactionId, transactionRequest } =
      await this.prepareTransaction(address, transaction);

    const predicateSignatureIndex = getMockedSignatureIndex(
      transactionRequest.witnesses,
    );

    const txId = await this.encodeTxId(transactionId);
    const provider: Maybe<SolanaProvider> =
      this.config.appkit.getWalletProvider() as SolanaProvider;
    if (!provider) {
      throw new Error('No provider found');
    }

    const signedMessage: Uint8Array = (await provider.signMessage(
      txId,
    )) as Uint8Array;
    transactionRequest.witnesses[predicateSignatureIndex] = signedMessage;

    // Send transaction
    await predicate.provider.estimatePredicates(transactionRequest);

    const response = await predicate.sendTransaction(transactionRequest);

    return response.id;
  }

  async signMessageCustomCurve(message: string) {
    const provider: Maybe<SolanaProvider> =
      this.config.appkit.getWalletProvider() as SolanaProvider;
    if (!provider) {
      throw new Error('No provider found');
    }
    const signedMessage: Uint8Array = (await provider.signMessage(
      toUtf8Bytes(message),
    )) as Uint8Array;
    return {
      curve: 'edDSA',
      signature: hexlify(signedMessage),
    };
  }

  static getFuelPredicateAddresses(svmAddress: string) {
    const predicateConfig = Object.entries(PREDICATE_VERSIONS)
      .sort(([, a], [, b]) => b.generatedAt - a.generatedAt)
      .map(([svmPredicateAddress, { predicate, generatedAt }]) => ({
        abi: predicate.abi,
        bin: predicate.bin,
        svmPredicate: {
          generatedAt,
          address: svmPredicateAddress,
        },
      }));

    const address = new SolanaWalletAdapter().convertAddress(svmAddress);
    const predicateAddresses = predicateConfig.map(
      ({ abi, bin, svmPredicate }) => ({
        fuelAddress: getFuelPredicateAddresses({
          signerAddress: address,
          predicate: { abi, bin },
        }),
        svmPredicate,
      }),
    );

    return predicateAddresses;
  }
}
