import {
  type FuelPredicateAddress,
  type Maybe,
  PredicateConnector,
  type PredicateCurrentState,
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
import type { PredicateSvmConfig } from './types';

export class PredicateSvm extends PredicateConnector {
  name = 'Solana Wallets';
  events = FuelConnectorEventTypes;
  metadata: ConnectorMetadata = {
    install: {
      action: '',
      description: '',
      link: '',
    },
  };

  private fuelProvider: FuelProvider;
  private config: PredicateSvmConfig;

  constructor(config: PredicateSvmConfig) {
    super();

    this.config = config;
    this.customPredicate = config.predicateConfig || null;
    const network = getProviderUrl(config?.chainId ?? CHAIN_IDS.fuel.mainnet);
    this.fuelProvider = new FuelProvider(network);
  }

  public async getCurrentState(): Promise<PredicateCurrentState> {
    const address = this.config.appkit.getAddress('solana');
    if (!address) {
      return {
        connection: false,
      };
    }

    await this.setupPredicate();

    return {
      connection: true,
      account: this.predicateAccount?.getPredicateAddress(address),
      accounts: this.predicateAccount?.getPredicateAddresses(
        await this.walletAccounts(),
      ),
    };
  }

  protected getWalletAdapter(): PredicateWalletAdapter {
    return new SolanaWalletAdapter();
  }

  protected getPredicateVersions(): Record<string, PredicateVersion> {
    return PREDICATE_VERSIONS;
  }

  protected walletAccounts(): Promise<Array<string>> {
    return new Promise((resolve) => {
      const acc = this.config.appkit.getAddress('solana');
      resolve(acc ? [acc] : []);
    });
  }

  protected getAccountAddress(): Maybe<string> {
    return this.config.appkit.getAddress('solana');
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

  private encodeTxId(txId: string): Uint8Array {
    const txIdNo0x = txId.slice(2);
    return new TextEncoder().encode(txIdNo0x);
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

    const txId = this.encodeTxId(transactionId);
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

  static getFuelPredicateAddresses(svmAddress: string): FuelPredicateAddress[] {
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
        predicate: svmPredicate,
      }),
    );

    return predicateAddresses;
  }
}
