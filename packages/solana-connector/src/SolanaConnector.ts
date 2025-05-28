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
import { ApiController } from '@web3modal/core';
import type { Web3Modal } from '@web3modal/solana';
import type { Provider as SolanaProvider } from '@web3modal/solana/dist/types/src/utils/scaffold';
import {
  CHAIN_IDS,
  type ConnectorMetadata,
  FuelConnectorEventTypes,
  Provider as FuelProvider,
  LocalStorage,
  type StorageAbstract,
  type TransactionRequestLike,
  type TransactionResponse,
  hexlify,
  toUtf8Bytes,
} from 'fuels';
import nacl from 'tweetnacl';
import { HAS_WINDOW, SOLANA_ICON, WINDOW } from './constants';
import { PREDICATE_VERSIONS } from './generated/predicates';
import type { SolanaConfig } from './types';
import { SolanaConnectorEvents } from './types';
import { createSolanaConfig, createSolanaWeb3ModalInstance } from './web3Modal';

const SIGNATURE_VALIDATION_KEY = (address: string) =>
  `SIGNATURE_VALIDATION_${address}`;

export class SolanaConnector extends PredicateConnector {
  name = 'Solana Wallets';
  events = {
    ...FuelConnectorEventTypes,
    ...SolanaConnectorEvents,
  };
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
  private storage: StorageAbstract;

  private isPollingSignatureRequestActive = false;

  constructor(config: SolanaConfig) {
    super();
    this.storage =
      config.storage || new LocalStorage(WINDOW?.localStorage as Storage);
    this.customPredicate = config.predicateConfig || null;
    if (HAS_WINDOW) {
      this.configProviders(config);
    }

    this.on(this.events.currentConnector, async () => {
      const address = this.web3Modal?.getAddress();
      if (!address) {
        return;
      }
    });
  }

  private async _emitDisconnect() {
    this.isPollingSignatureRequestActive = false;
    this.svmAddress = null;
    await this.setupPredicate();
    this.emit(this.events.connection, false);
    this.emit(this.events.accounts, []);
    this.emit(this.events.currentAccount, null);
  }

  private _emitSignatureError(_error: unknown) {
    this.isPollingSignatureRequestActive = false;
    this.emit(SolanaConnectorEvents.ERROR, new Error('Failed to sign message'));
    this.web3Modal.disconnect();
    this._emitDisconnect();
  }

  private async _emitConnected() {
    const address = this.web3Modal?.getAddress();
    const predicate = this.predicateAccount?.getPredicateAddress(address || '');
    await this.setupPredicate();
    if (!address || !this.predicateAccount) {
      return;
    }
    this.svmAddress = address;
    this.emit(this.events.connection, true);
    this.emit(this.events.currentAccount, predicate);
    const accounts = await this.walletAccounts();
    const _accounts = this.predicateAccount?.getPredicateAddresses(accounts);
    this.emit(this.events.accounts, _accounts);
  }

  private modalFactory(config?: SolanaConfig) {
    const solanaConfig = createSolanaConfig(config?.projectId);

    return createSolanaWeb3ModalInstance({
      projectId: config?.projectId,
      solanaConfig,
    });
  }

  private providerFactory(config?: SolanaConfig) {
    const network = getProviderUrl(config?.chainId ?? CHAIN_IDS.fuel.mainnet);
    return config?.fuelProvider || new FuelProvider(network);
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
      if (!this.web3Modal || this.isPollingSignatureRequestActive) {
        return;
      }
      const address = this.web3Modal.getAddress();
      if (address && address !== this.svmAddress) {
        const hasValidation = await this.accountHasValidation(address);
        if (hasValidation) {
          this.svmAddress = address;
          this._emitConnected();
        } else {
          const currentStorage = await this.storage.getItem(
            SIGNATURE_VALIDATION_KEY(address),
          );
          if (currentStorage !== 'pending' && currentStorage !== 'true') {
            await this.storage.setItem(
              SIGNATURE_VALIDATION_KEY(address),
              'pending',
            );
            this.emit(this.events.currentConnector, {
              metadata: { pendingSignature: true },
            });
          }
        }
      } else if (!address && this.svmAddress) {
        this._emitDisconnect();
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
    const network = getProviderUrl(config.chainId ?? CHAIN_IDS.fuel.mainnet);
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || new FuelProvider(network),
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
    if (!this.web3Modal) {
      this.createModal();
    }
    const currentAddress = this.web3Modal.getAddress();
    if (currentAddress) {
      const storageValue = await this.storage.getItem(
        SIGNATURE_VALIDATION_KEY(currentAddress),
      );
      if (storageValue === 'pending') {
        this.isPollingSignatureRequestActive = true;
        try {
          const provider = this.web3Modal.getWalletProvider() as SolanaProvider;
          if (!provider) throw new Error('Connect(Pending): No provider');
          const message = `Sign this message to verify the connected account: ${currentAddress}`;
          const messageBytes = new TextEncoder().encode(message);
          const signedMessage = await provider.signMessage(messageBytes);
          const signature =
            'signature' in signedMessage
              ? signedMessage.signature
              : signedMessage;
          const publicKey = provider.publicKey;
          if (!publicKey) throw new Error('Connect(Pending): No public key');
          const isValid = nacl.sign.detached.verify(
            messageBytes,
            signature,
            publicKey.toBytes(),
          );

          if (isValid) {
            await this.storage.setItem(
              SIGNATURE_VALIDATION_KEY(currentAddress),
              'true',
            );
            this._emitConnected();
            this.isPollingSignatureRequestActive = false;
            return true;
          }
          await this.storage.removeItem(
            SIGNATURE_VALIDATION_KEY(currentAddress),
          ); // Clean up storage
          this._emitSignatureError(
            new Error('Invalid signature provided during connect.'),
          );
          this.isPollingSignatureRequestActive = false;
          return false;
        } catch (error) {
          this._emitSignatureError(error);
          this.isPollingSignatureRequestActive = false;
          return false;
        }
      } else if (storageValue === 'true') {
        this._emitConnected();
        return true;
      }
    }

    this.web3Modal.open();

    return new Promise((resolve) => {
      const unsub = this.web3Modal.subscribeEvents(async (event) => {
        switch (event.data.event) {
          case 'CONNECT_SUCCESS': {
            const provider =
              this.web3Modal.getWalletProvider() as SolanaProvider;
            const address = provider?.publicKey?.toString();
            if (!address || !provider || !provider.publicKey) {
              resolve(false);
              unsub();
              break;
            }

            try {
              const hasValidation = await this.accountHasValidation(address);
              if (hasValidation) {
                this._emitConnected();
                resolve(true);
              } else {
                await this.storage.setItem(
                  SIGNATURE_VALIDATION_KEY(address),
                  'pending',
                );
                this.emit(this.events.currentConnector, {
                  metadata: { pendingSignature: true },
                });
                resolve(false);
              }
            } catch (error) {
              this._emitSignatureError(error);
              resolve(false);
            } finally {
              unsub();
            }
            break;
          }
          case 'MODAL_CLOSE': {
            resolve(false);
            unsub();
            break;
          }
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
    console.log(
      '!!! public disconnect() CALLED !!! - Will call _emitDisconnect.',
    );
    this.web3Modal.disconnect();
    this._emitDisconnect();
    await super.disconnect();
    return await this.isConnected();
  }

  private encodeTxId(txId: string): Uint8Array {
    const txIdNo0x = txId.slice(2);
    return new TextEncoder().encode(txIdNo0x);
  }

  public async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<string | TransactionResponse> {
    const { predicate, transactionId, transactionRequest } =
      await this.prepareTransaction(address, transaction);

    const predicateSignatureIndex = getMockedSignatureIndex(
      transactionRequest.witnesses,
    );

    const txId = this.encodeTxId(transactionId);
    const provider: Maybe<SolanaProvider> =
      this.web3Modal.getWalletProvider() as SolanaProvider;
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

    return response;
  }

  async signMessageCustomCurve(message: string) {
    const provider: Maybe<SolanaProvider> =
      this.web3Modal.getWalletProvider() as SolanaProvider;
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

  private async accountHasValidation(
    account: string | undefined,
  ): Promise<boolean> {
    if (!account) {
      return false;
    }
    try {
      const storageKey = SIGNATURE_VALIDATION_KEY(account);
      const isValidated = await this.storage.getItem(storageKey);
      return isValidated === 'true';
    } catch (err) {
      console.error(
        `[Validation Check] Error checking storage for ${account}:`,
        err,
      );
      return false;
    }
  }

  public async isConnected(): Promise<boolean> {
    const address = this.web3Modal?.getAddress();
    if (!address) {
      return false;
    }

    return await this.accountHasValidation(address);
  }
}
