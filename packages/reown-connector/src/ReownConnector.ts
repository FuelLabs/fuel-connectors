import { hexToBytes } from '@ethereumjs/util';
import { splitSignature } from '@ethersproject/bytes';
import {
  type FuelPredicateAddress,
  type Maybe,
  type MaybeAsync,
  PredicateConnector,
  type PredicateVersion,
  type PredicateWalletAdapter,
  type ProviderDictionary,
  type SignedMessageCustomCurve,
  getFuelPredicateAddresses,
  getMockedSignatureIndex,
  getProviderUrl,
} from '@fuel-connectors/common';
import type { AppKit } from '@reown/appkit';

import {
  CHAIN_IDS,
  type FuelConnectorSendTxParams,
  LocalStorage,
  Provider,
  type StorageAbstract,
  type TransactionRequestLike,
  type TransactionResponse,
} from 'fuels';
import {
  type REOWN_NAMESPACES,
  SIGNATURE_VALIDATION_TIMEOUT,
} from './constants';
import type {
  CustomCurrentConnectorEvent,
  ReownConnectorConfig,
} from './types';

export abstract class ReownConnector extends PredicateConnector {
  public override installed = true;
  public override connected = false;

  protected appkit: AppKit;
  private fuelProvider: Provider;
  private storage: StorageAbstract;

  /** If undefined, the connector is not connected */
  public abstract namespace: (typeof REOWN_NAMESPACES)[keyof typeof REOWN_NAMESPACES];

  protected static PREDICATE_VERSIONS: Record<string, PredicateVersion> = {};
  protected static WALLET_ADAPTER: PredicateWalletAdapter;

  constructor(opts: ReownConnectorConfig) {
    super();
    const network = getProviderUrl(opts.chainId ?? CHAIN_IDS.fuel.testnet);
    this.fuelProvider = opts.fuelProvider || new Provider(network);
    this.storage = opts.storage || new LocalStorage(window.localStorage);
    this.appkit = opts.appkit;
    this.appkit.subscribeAccount((account) => {
      if (account.status === 'connected') {
        this.handleAccountConnected();
      }
    });
  }

  private handleAccountConnected = async () => {
    const _isConnected = this.appkit.getIsConnectedState();
    const nativeAddress = this.appkit.getAddress(this.namespace);

    // If there is no current address, we're not connection
    if (!nativeAddress) {
      // Do we want to trigger a disconnect?
      return;
    }

    const validated = await this.getAccountValidation(nativeAddress);
    if (validated === 'idle') {
      this.storage.setItem(`SIGNATURE_VALIDATION_${nativeAddress}`, 'pending');
      return;
    }

    if (validated === 'pending') {
      const event: CustomCurrentConnectorEvent = {
        type: this.events.currentConnector,
        data: this,
        metadata: {
          pendingSignature: true,
        },
      };
      this.emit(this.events.currentConnector, event);
      return;
    }

    this.connected = true;
    this.emitAccountChange(nativeAddress, true);
    return;
  };

  /**
   * Connector methods
   */
  override async ping(): Promise<boolean> {
    return true;
  }

  override async connect(): Promise<boolean> {
    const isConnected = this.appkit.getIsConnectedState();
    const nativeAddress = this.appkit.getAddress(this.namespace);

    // Already connected
    if (isConnected && nativeAddress) {
      const isValidated = await this.requestAccountSignature(nativeAddress);

      if (isValidated) {
        this.handleAccountConnected();
        return true;
      }

      return false;
    }

    await this.appkit.open({
      view: 'Connect',
      namespace: this.namespace,
    });

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const nativeAddress = this.appkit.getAddress(this.namespace);
        const isModalOpen = this.appkit.isOpen();

        // Modal closed and no address
        if (!isModalOpen && !nativeAddress) {
          clearInterval(interval);
          resolve(false);
          return;
        }

        // Connected to address
        if (nativeAddress) {
          return this.handleAccountConnected()
            .then(() => {
              clearInterval(interval);
              resolve(false);
            })
            .catch((error) => {
              clearInterval(interval);
              reject(error);
            });
        }
      }, 300);
    });
  }

  override async disconnect(): Promise<boolean> {
    try {
      await super.disconnect();

      this.connected = false;
      this.emit(this.events.connection, false);
      this.emit(this.events.currentAccount, null);
      this.emit(this.events.accounts, []);

      await this.appkit.disconnect();

      return true;
    } catch (error) {
      console.error('ReownConnector - Unable to disconnect', error);

      return false;
    }
  }

  override async isConnected(): Promise<boolean> {
    return this.connected;
  }

  override async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
    params?: FuelConnectorSendTxParams,
  ): Promise<string | TransactionResponse> {
    const { fuelProvider } = await this.getProviders();
    const { predicate, request, transactionId, transactionRequest } =
      await this.prepareTransaction(address, transaction);

    const txId = this.encodeTxId(transactionId);
    const { signature } = await this.signMessageCustomCurve(txId);

    const predicateSignatureIndex = getMockedSignatureIndex(
      transactionRequest.witnesses,
    );

    // Transform the signature into compact form for Sway to understand
    const compactSignature = splitSignature(hexToBytes(signature)).compact;
    transactionRequest.witnesses[predicateSignatureIndex] = compactSignature;

    const transactionWithPredicateEstimated =
      await fuelProvider.estimatePredicates(request);

    let txAfterUserCallback = transactionWithPredicateEstimated;
    if (params?.onBeforeSend) {
      txAfterUserCallback = await params.onBeforeSend(
        transactionWithPredicateEstimated,
      );
    }

    const response = await predicate.sendTransaction(txAfterUserCallback);
    await response.waitForPreConfirmation();
    return response;
  }

  /**
   * Predicate connector methods
   */
  protected override getProviders(): Promise<ProviderDictionary> {
    return Promise.resolve({
      fuelProvider: this.fuelProvider,
    });
  }

  protected override getAccountAddress(): MaybeAsync<Maybe<string>> {
    const nativeAddress = this.appkit.getAddress(this.namespace);
    return Promise.resolve(nativeAddress);
  }

  protected override async walletAccounts(): Promise<Array<string>> {
    const nativeAddress = await this.getAccountAddress();
    return Promise.resolve(nativeAddress ? [nativeAddress] : []);
  }

  abstract override signMessageCustomCurve(
    message: string,
  ): Promise<SignedMessageCustomCurve>;
  protected abstract encodeTxId(txId: string): string;
  protected abstract verifySignature(
    address: string,
    message: string,
    signature: string,
  ): Promise<boolean>;

  /**
   * Account validation
   */
  private async getAccountValidation(
    nativeAddress: string,
  ): Promise<'true' | 'pending' | 'idle'> {
    const storageItem = await this.storage.getItem(
      `SIGNATURE_VALIDATION_${nativeAddress}`,
    );

    const state = storageItem as 'true' | 'pending' | null;
    if (!state) {
      return 'idle';
    }

    return state;
  }

  private async isAccountValidated(nativeAddress: string): Promise<boolean> {
    const state = await this.getAccountValidation(nativeAddress);
    return state === 'true';
  }

  private async requestAccountSignature(
    nativeAddress: string,
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      // Check whether the account is already validated
      const isValidated = await this.isAccountValidated(nativeAddress);
      if (isValidated) {
        return resolve(true);
      }

      // Disconnect if user doesn't provide signature in time
      const validationTimeout = setTimeout(() => {
        this.storage.removeItem(`SIGNATURE_VALIDATION_${nativeAddress}`);
        reject(
          new Error("User didn't provide signature in less than 1 minute"),
        );
      }, SIGNATURE_VALIDATION_TIMEOUT);

      // Sign the message
      const message = `Sign this message to verify the connected account: ${nativeAddress}`;
      const { signature } = await this.signMessageCustomCurve(message);

      // Check that the signature is valid
      const isValid = await this.verifySignature(
        nativeAddress,
        message,
        signature,
      );
      if (isValid) {
        clearTimeout(validationTimeout);
        this.storage.setItem(`SIGNATURE_VALIDATION_${nativeAddress}`, 'true');
        resolve(true);
      } else {
        clearTimeout(validationTimeout);
        this.storage.removeItem(`SIGNATURE_VALIDATION_${nativeAddress}`);
        reject(new Error('Signature validation failed'));
      }
    });
  }

  static getFuelPredicateAddresses(
    nativeAddress: string,
  ): FuelPredicateAddress[] {
    const predicateConfig = Object.entries(ReownConnector.PREDICATE_VERSIONS)
      .sort(([, a], [, b]) => b.generatedAt - a.generatedAt)
      .map(([evmPredicateAddress, { predicate, generatedAt }]) => ({
        abi: predicate.abi,
        bin: predicate.bin,
        evmPredicate: {
          generatedAt,
          address: evmPredicateAddress,
        },
      }));

    const address = ReownConnector.WALLET_ADAPTER.convertAddress(nativeAddress);
    const predicateAddresses = predicateConfig.map(
      ({ abi, bin, evmPredicate }) => ({
        fuelAddress: getFuelPredicateAddresses({
          signerAddress: address,
          predicate: { abi, bin },
        }),
        predicate: evmPredicate,
      }),
    );

    return predicateAddresses;
  }
}
