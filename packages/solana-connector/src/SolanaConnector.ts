import {
  type Maybe,
  type Predicate,
  PredicateConnector,
  type PredicateWalletAdapter,
  type ProviderDictionary,
  SolanaWalletAdapter,
  getOrThrow,
  getSignatureIndex,
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
import { VERSIONS } from '../versions/versions-dictionary';
import { SOLANA_ICON, TESTNET_URL } from './constants';
import { createSolanaProvider } from './provider';
import type { SolanaConfig } from './types';

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
  protected predicateAddress: string | null = null;

  private web3Modal!: Web3Modal;
  private config: SolanaConfig = {};
  private svmAddress: string | null = null;

  constructor(config: SolanaConfig = {}) {
    super();

    this.customPredicate = config.predicateConfig || null;
    this.configProviders(config);
  }

  private async _emit(connected: boolean) {
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

  private setupWatchers() {
    this.subscribe(
      this.web3Modal.subscribeEvents(async (event) => {
        switch (event.data.event) {
          case 'CONNECT_SUCCESS': {
            this._emit(true);
            break;
          }
          case 'DISCONNECT_SUCCESS': {
            this._emit(false);
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
        this._emit(true);
      }

      if (!address && this.svmAddress) {
        this._emit(false);
      }
    }, 300);

    this.subscribe(() => clearInterval(interval));
  }

  // createModal re-instanciates the modal to update singletons from web3modal
  private createModal() {
    this.clearSubscriptions();
    const { walletConnectModal } = createSolanaProvider(this.config);
    this.web3Modal = walletConnectModal;
    ApiController.prefetch();
    this.setupWatchers();
  }

  protected async requireConnection() {
    if (!this.web3Modal) this.createModal();
  }

  protected getWalletAdapter(): PredicateWalletAdapter {
    return new SolanaWalletAdapter();
  }

  protected getPredicateVersions(): Record<string, Predicate> {
    return VERSIONS;
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
    return this.web3Modal.getAddress();
  }

  protected async getProviders(): Promise<ProviderDictionary> {
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
    this._emit(false);
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
    const { predicate, transactionId, transactionRequest } =
      await this.prepareTransaction(address, transaction);

    const predicateSignatureIndex = getSignatureIndex(
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

    return response.id;
  }
}
