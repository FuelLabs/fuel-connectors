import {
  ecrecover,
  fromRpcSig,
  hashPersonalMessage,
  hexToBytes,
  pubToAddress,
} from '@ethereumjs/util';
import { hexlify, splitSignature } from '@ethersproject/bytes';
import {
  type EIP1193Provider,
  EthereumWalletAdapter,
  type FuelPredicateAddress,
  type Maybe,
  PredicateConnector,
  type PredicateCurrentState,
  type PredicateVersion,
  type PredicateWalletAdapter,
  type ProviderDictionary,
  getFuelPredicateAddresses,
  getMockedSignatureIndex,
  getProviderUrl,
} from '@fuel-connectors/common';
import {
  PREDICATE_VERSIONS,
  txIdEncoders,
} from '@fuel-connectors/evm-predicates';
import {
  CHAIN_IDS,
  type ConnectorMetadata,
  FuelConnectorEventTypes,
  type FuelConnectorSendTxParams,
  Provider as FuelProvider,
  type StorageAbstract,
  type TransactionRequestLike,
} from 'fuels';
import { stringToHex } from 'viem';
import { SIGNATURE_VALIDATION_TIMEOUT } from './constants';
import type { PredicateEvmConfig } from './types';

export class PredicateEvm extends PredicateConnector {
  name = 'Ethereum Wallets';
  installed = true;
  events = FuelConnectorEventTypes;
  metadata: ConnectorMetadata = {
    image: '',
    install: {
      action: '',
      description: '',
      link: '',
    },
  };

  private fuelProvider: FuelProvider | null = null;
  private config: PredicateEvmConfig;
  private storage: StorageAbstract;

  constructor(config: PredicateEvmConfig, storage: StorageAbstract) {
    super();

    this.config = config;
    this.storage = storage;

    this.customPredicate = config.predicateConfig || null;
  }

  public async getCurrentState(): Promise<PredicateCurrentState> {
    const address = this.config.appkit.getAddress('eip155');
    if (!address) {
      return {
        connection: false,
      };
    }

    const hasSignature = await this.accountHasValidation(address);
    if (!hasSignature) {
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
    return new EthereumWalletAdapter();
  }

  protected getPredicateVersions(): Record<string, PredicateVersion> {
    return PREDICATE_VERSIONS;
  }

  protected async walletAccounts(): Promise<Array<string>> {
    return Promise.resolve((await this.getAccountAddresses()) as Array<string>);
  }

  public async getAccountAddress(): Promise<Maybe<string>> {
    const address = this.config.appkit.getAddress('eip155');
    if (!address) return null;
    if (!(await this.accountHasValidation(address))) return null;
    return address;
  }

  protected async getAccountAddresses(): Promise<Maybe<readonly string[]>> {
    const address = this.config.appkit.getAddress('eip155');
    if (!address) return null;
    if (!(await this.accountHasValidation(address))) return [];
    return [address];
  }

  protected async getProviders(): Promise<ProviderDictionary> {
    if (this.fuelProvider) {
      return {
        fuelProvider: this.fuelProvider,
      };
    }

    const network = getProviderUrl(
      this.config?.chainId ?? CHAIN_IDS.fuel.mainnet,
    );
    const provider = this.config.fuelProvider || new FuelProvider(network);
    this.fuelProvider = await provider;

    return {
      fuelProvider: this.fuelProvider,
    };
  }

  public async connect(): Promise<boolean> {
    const account = this.config.appkit.getAddress('eip155');
    if (!account) return false;

    // 1. Trigger signing step (only if needed – user might have signed already)
    const signatureState = await this.getAccountValidation(account);
    if (signatureState === 'idle') {
      this.storage.setItem(`SIGNATURE_VALIDATION_${account}`, 'pending');
      throw new Error('Signature is pending');
    }

    // 2. Now let's ask for the signatures if it's pending
    await this.requestSignatures(account);
    return true;
  }

  private async getAccountValidation(
    account: `0x${string}` | string | undefined,
  ): Promise<'true' | 'pending' | 'idle'> {
    const state = (await this.storage.getItem(
      `SIGNATURE_VALIDATION_${account}`,
    )) as 'true' | 'pending' | null;

    if (!state) {
      return 'idle';
    }

    return state;
  }

  private async accountHasValidation(
    account: `0x${string}` | string | undefined,
  ) {
    if (!account) return false;
    const state = await this.getAccountValidation(account);
    return state === 'true';
  }

  private async requestSignatures(
    account: string | undefined,
  ): Promise<'validated'> {
    try {
      await this.requestSignature(account);
      return 'validated';
    } catch (err) {
      await this.disconnect();
      throw err;
    }
  }

  private async requestSignature(address?: string) {
    return new Promise(async (resolve, reject) => {
      const hasSignature = await this.accountHasValidation(address);
      if (hasSignature) return resolve(true);

      // Disconnect if user doesn't provide signature in time
      const validationTimeout = setTimeout(() => {
        this.storage.removeItem(`SIGNATURE_VALIDATION_${address}`);
        reject(
          new Error("User didn't provide signature in less than 1 minute"),
        );
      }, SIGNATURE_VALIDATION_TIMEOUT);
      const ethProvider =
        this.config.appkit.getProvider<EIP1193Provider>('eip155');

      if (!ethProvider) return;

      this.signAndValidate(ethProvider, address)
        .then(() => {
          clearTimeout(validationTimeout);
          this.storage.setItem(`SIGNATURE_VALIDATION_${address}`, 'true');
          resolve(true);
        })
        .catch((err) => {
          clearTimeout(validationTimeout);
          this.storage.removeItem(`SIGNATURE_VALIDATION_${address}`);
          reject(err);
        });
    });
  }

  public async disconnect(): Promise<boolean> {
    await this.config.appkit.disconnect();
    return false;
  }

  public async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
    params?: FuelConnectorSendTxParams,
  ): Promise<string> {
    const { fuelProvider } = await this.getProviders();
    const ethProvider =
      this.config.appkit.getProvider<EIP1193Provider>('eip155');
    const { request, transactionId, account, transactionRequest } =
      await this.prepareTransaction(address, transaction);

    const txId = this.encodeTxId(transactionId);
    const signature = (await ethProvider?.request({
      method: 'personal_sign',
      params: [txId, account],
    })) as string;

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

    const response = await fuelProvider.operations.submit({
      encodedTransaction: hexlify(txAfterUserCallback.toTransactionBytes()),
    });

    return response.submit.id;
  }

  private encodeTxId(txId: string): string {
    const encoder = txIdEncoders[this.predicateAddress];
    if (!encoder) {
      return txId;
    }

    return encoder.encodeTxId(txId);
  }

  private validateSignature(
    account: string,
    message: string,
    signature: string,
  ) {
    const msgBuffer = Uint8Array.from(Buffer.from(message));
    const msgHash = hashPersonalMessage(msgBuffer);
    const { v, r, s } = fromRpcSig(signature);
    const pubKey = ecrecover(msgHash, v, r, s);
    const recoveredAddress = Buffer.from(pubToAddress(pubKey)).toString('hex');

    // The recovered address doesn't have the 0x prefix
    return recoveredAddress.toLowerCase() === account.toLowerCase().slice(2);
  }

  private async signAndValidate(
    ethProvider: EIP1193Provider | undefined,
    account?: string,
  ) {
    try {
      if (!ethProvider) {
        throw new Error('No Ethereum provider found');
      }
      if (account && !account.startsWith('0x')) {
        throw new Error('Invalid account address');
      }
      const currentAccount =
        account ||
        (
          (await ethProvider.request({
            method: 'eth_requestAccounts',
          })) as string[]
        )[0];

      if (!currentAccount) {
        throw new Error('No Ethereum account selected');
      }

      const message = `Sign this message to verify the connected account: ${currentAccount}`;
      const signature = (await ethProvider.request({
        method: 'personal_sign',
        params: [stringToHex(message), currentAccount],
      })) as string;

      if (!this.validateSignature(currentAccount, message, signature)) {
        throw new Error('Signature address validation failed');
      }

      return true;
    } catch (error) {
      await this.disconnect();
      throw error;
    }
  }

  async signMessageCustomCurve(message: string) {
    const ethProvider =
      this.config.appkit.getProvider<EIP1193Provider>('eip155');
    if (!ethProvider) throw new Error('Eth provider not found');
    const accountAddress = await this.getAccountAddress();
    if (!accountAddress) throw new Error('No connected accounts');
    const signature = await ethProvider.request({
      method: 'personal_sign',
      params: [accountAddress, message],
    });
    return {
      curve: 'secp256k1',
      signature: signature as string,
    };
  }

  static getFuelPredicateAddresses(ethAddress: string): FuelPredicateAddress[] {
    const predicateConfig = Object.entries(PREDICATE_VERSIONS)
      .sort(([, a], [, b]) => b.generatedAt - a.generatedAt)
      .map(([evmPredicateAddress, { predicate, generatedAt }]) => ({
        abi: predicate.abi,
        bin: predicate.bin,
        evmPredicate: {
          generatedAt,
          address: evmPredicateAddress,
        },
      }));

    const address = new EthereumWalletAdapter().convertAddress(ethAddress);
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
