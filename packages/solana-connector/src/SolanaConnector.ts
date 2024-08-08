import { hexToBytes } from '@ethereumjs/util';
import {
  type Maybe,
  PredicateConnector,
  type PredicateVersion,
  type PredicateWalletAdapter,
  type ProviderDictionary,
  SolanaWalletAdapter,
  getMockedSignatureIndex,
  getOrThrow,
} from '@fuel-connectors/common';
import { ApiController } from '@web3modal/core';
import type { Web3Modal } from '@web3modal/solana';
import type { Provider } from '@web3modal/solana/dist/types/src/utils/scaffold';
import {
  type ConnectorMetadata,
  FuelConnectorEventTypes,
  Provider as FuelProvider,
  type TransactionRequestLike,
} from 'fuels';
import { SOLANA_ICON, TESTNET_URL } from './constants';
import { PREDICATE_VERSIONS } from './generated/predicates';
import type { SolanaConfig } from './types';
import { createSolanaConfig, createSolanaWeb3ModalInstance } from './web3Modal';

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

  private web3Modal!: Web3Modal;
  private config: SolanaConfig = {};
  private svmAddress: string | null = null;

  constructor(config: SolanaConfig) {
    super();
    this.customPredicate = config.predicateConfig || null;
    this.configProviders(config);
  }

  private async _emitConnected(connected: boolean) {
    if (connected) await this.setupPredicate();
    this.emit(this.events.connection, connected);

    const address = this.web3Modal.getAddress();
    this.emit(
      this.events.currentAccount,
      address ? this.predicateAccount?.getPredicateAddress(address) : null,
    );
    const accounts = await this.walletAccounts();
    this.emit(
      this.events.accounts,
      accounts.length > 0
        ? this.predicateAccount?.getPredicateAddresses(accounts)
        : [],
    );
    this.svmAddress = address ?? null;
  }

  private modalFactory(config?: SolanaConfig) {
    const solanaConfig = createSolanaConfig(config?.projectId);

    return createSolanaWeb3ModalInstance({
      projectId: config?.projectId,
      solanaConfig,
    });
  }

  private providerFactory(config?: SolanaConfig) {
    return config?.fuelProvider || FuelProvider.create(TESTNET_URL);
  }

  // Solana Web3Modal is Canary and not yet stable
  // It shares the same events as WalletConnect, hence validations must be made in order to avoid running connections with EVM Addresses instead of Solana Addresses
  private setupWatchers() {
    this.subscribe(
      this.web3Modal.subscribeEvents((event) => {
        switch (event.data.event) {
          case 'MODAL_OPEN':
            // Ensures that the Solana Web3Modal config is applied over pre-existing states (e.g. WC Connect Web3Modal)
            this.createModal();
            break;
          case 'CONNECT_SUCCESS': {
            const address = this.web3Modal.getAddress() || '';
            if (!address || address.startsWith('0x')) {
              return;
            }
            this._emitConnected(true);
            break;
          }
          case 'DISCONNECT_SUCCESS': {
            this._emitConnected(false);
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
        this._emitConnected(true);
      }

      if (!address && this.svmAddress) {
        this._emitConnected(false);
      }
    }, 300);

    this.subscribe(() => clearInterval(interval));
  }

  // createModal re-instanciates the modal to update singletons from web3modal
  private createModal() {
    this.clearSubscriptions();
    const web3Modal = this.modalFactory(this.config);
    this.web3Modal = web3Modal;
    ApiController.prefetch();
    this.setupWatchers();
  }

  protected async requireConnection() {
    if (!this.web3Modal) this.createModal();
  }

  protected getWalletAdapter(): PredicateWalletAdapter {
    return new SolanaWalletAdapter();
  }

  protected getPredicateVersions(): Record<string, PredicateVersion> {
    return PREDICATE_VERSIONS;
  }

  protected async configProviders(config: SolanaConfig = {}) {
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || FuelProvider.create(TESTNET_URL),
    });
  }

  protected walletAccounts(): Promise<Array<string>> {
    if (!this.web3Modal) {
      return Promise.resolve([]);
    }

    return new Promise((resolve) => {
      const acc = this.web3Modal.getAddress();
      resolve(acc ? [acc] : []);
    });
  }

  protected getAccountAddress(): Maybe<string> {
    if (!this.web3Modal) return null;

    return this.web3Modal.getAddress();
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

  public async disconnect(): Promise<boolean> {
    this.web3Modal.disconnect();
    this._emitConnected(false);
    return this.isConnected();
  }

  public truncateTxId(txId: string): Uint8Array {
    const txIdNo0x = txId.slice(2);
    const idBytes = `${txIdNo0x.slice(0, 16)}${txIdNo0x.slice(-16)}`;
    return new TextEncoder().encode(idBytes);
  }

  public async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<string> {
    const { predicate, transactionId, transactionRequest, afterTransaction } =
      await this.prepareTransaction(address, transaction);

    const predicateSignatureIndex = getMockedSignatureIndex(
      transactionRequest.witnesses,
    );
    const txId = this.truncateTxId(transactionId);
    const provider: Maybe<Provider> =
      this.web3Modal.getWalletProvider() as Provider;
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

    afterTransaction?.(response.id);

    return response.id;
  }
}
