import {
  type Maybe,
  PredicateConnector,
  type PredicateVersion,
  type PredicateWalletAdapter,
  type ProviderDictionary,
  SolanaWalletAdapter,
  getFuelPredicateAddresses,
  getMockedSignatureIndex,
  getOrThrow,
  getProviderUrl,
} from '@fuel-connectors/common';
import type { AppKit } from '@reown/appkit';
import type { Provider as SolanaProvider } from '@reown/appkit-utils/solana';
import {
  CHAIN_IDS,
  type ConnectorMetadata,
  FuelConnectorEventTypes,
  Provider as FuelProvider,
  LocalStorage,
  type StorageAbstract,
  type TransactionRequestLike,
  hexlify,
  toUtf8Bytes,
} from 'fuels';
import {
  createAppkitInstance,
  createDefaultSolanaAdapter,
} from './appkitModal';
import { HAS_WINDOW, SOLANA_ICON } from './constants';
import { PREDICATE_VERSIONS } from './generated/predicates';
import type { SolanaConfig } from './types';
import { type SolanaPredicateRoot, txIdEncoders } from './utils';

export class SolanaConnector extends PredicateConnector {
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

  protected fuelProvider!: FuelProvider;

  private appkit: AppKit | null = null;
  private storage: StorageAbstract;
  private config: SolanaConfig = {};
  private svmAddress: string | null = null;

  constructor(config: SolanaConfig) {
    super();

    this.customPredicate = config.predicateConfig || null;
    this.storage = new LocalStorage(window.localStorage as Storage);

    if (HAS_WINDOW) {
      this.configProviders(config);
    }
  }

  private async _emitDisconnect() {
    this.svmAddress = null;
    await this.setupPredicate();
    this.emit(this.events.connection, false);
    this.emit(this.events.accounts, []);
    this.emit(this.events.currentAccount, null);
  }

  private async _emitConnected() {
    await this.setupPredicate();
    const address = this.appkit?.getAddress();
    if (!address || !this.predicateAccount) return;
    this.svmAddress = address;
    this.emit(this.events.connection, true);
    const predicate = this.predicateAccount.getPredicateAddress(address);
    this.emit(this.events.currentAccount, predicate);
    const accounts = await this.walletAccounts();
    const _accounts = this.predicateAccount?.getPredicateAddresses(accounts);
    this.emit(this.events.accounts, _accounts);
  }

  private modalFactory(config: SolanaConfig) {
    const defaultAdapter = createDefaultSolanaAdapter();
    const solanaAdapter = config.solanaAdapter ?? defaultAdapter;

    return createAppkitInstance({
      projectId: config.projectId,
      solanaAdapter,
    });
  }

  private providerFactory(config?: SolanaConfig) {
    const network = getProviderUrl(config?.chainId ?? CHAIN_IDS.fuel.mainnet);
    return config?.fuelProvider || FuelProvider.create(network);
  }

  private setupWatchers() {
    if (!this.appkit) {
      return;
    }

    this.subscribe(
      this.appkit.subscribeEvents((event) => {
        switch (event.data.event) {
          case 'CONNECT_SUCCESS': {
            const address = this.appkit?.getAddress() || '';
            if (!address || address.startsWith('0x')) {
              return;
            }
            this._emitConnected();
            break;
          }
          case 'DISCONNECT_SUCCESS': {
            this._emitDisconnect();
            break;
          }
        }
      }),
    );

    // Poll for account changes due a problem with the event listener not firing on account changes
    const interval = setInterval(async () => {
      if (!this.appkit) {
        return;
      }
      const address = this.appkit.getAddress();
      if (address && address !== this.svmAddress) {
        this._emitConnected();
      }
      if (!address && this.svmAddress) {
        this._emitDisconnect();
      }
    }, 300);

    this.subscribe(() => clearInterval(interval));
  }

  // createModal re-instanciates the modal to update singletons from @reown/appkit
  private createModal() {
    this.clearSubscriptions();
    this.storage.removeItem('@appkit/active_namespace');
    this.storage.removeItem('@appkit/active_caip_network_id');
    this.storage.removeItem('@appkit/active_namespace');
    this.appkit = this.modalFactory(this.config);
    this.setupWatchers();
  }

  protected async requireConnection() {
    if (!this.appkit) this.createModal();
  }

  protected getWalletAdapter(): PredicateWalletAdapter {
    return new SolanaWalletAdapter();
  }

  protected getPredicateVersions(): Record<string, PredicateVersion> {
    return PREDICATE_VERSIONS;
  }

  protected async configProviders(config: SolanaConfig = {}) {
    const network = getProviderUrl(config.chainId ?? CHAIN_IDS.fuel.mainnet);
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || FuelProvider.create(network),
    });
  }

  protected walletAccounts(): Promise<Array<string>> {
    if (!this.appkit) {
      return Promise.resolve([]);
    }

    return new Promise((resolve) => {
      const acc = this.appkit?.getAddress();
      resolve(acc ? [acc] : []);
    });
  }

  protected getAccountAddress(): Maybe<string> {
    if (!this.appkit) return null;
    return this.appkit.getAddress();
  }

  protected async getProviders(): Promise<ProviderDictionary> {
    if (!this.config?.fuelProvider) {
      this.config = Object.assign(this.config, {
        fuelProvider: this.providerFactory(this.config),
      });
    }

    if (!this.fuelProvider) {
      this.fuelProvider = getOrThrow(
        await this.config.fuelProvider,
        'Fuel provider not found',
      );
    }

    return {
      fuelProvider: this.fuelProvider,
    };
  }

  public async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      this.appkit?.open();
      const unsub = this.appkit?.subscribeEvents(async (event) => {
        switch (event.data.event) {
          case 'CONNECT_SUCCESS': {
            resolve(true);
            unsub?.();
            break;
          }
          case 'MODAL_CLOSE':
          case 'CONNECT_ERROR': {
            resolve(false);
            unsub?.();
            break;
          }
        }
      });
    });
  }

  public async disconnect(): Promise<boolean> {
    this.appkit?.disconnect();
    this._emitDisconnect();
    return this.isConnected();
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
      this.appkit?.getWalletProvider() as SolanaProvider;
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
      this.appkit?.getWalletProvider() as SolanaProvider;
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
