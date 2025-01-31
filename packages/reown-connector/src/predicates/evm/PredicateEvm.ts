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
  type Maybe,
  PredicateConnector,
  type PredicateVersion,
  type PredicateWalletAdapter,
  type ProviderDictionary,
  getFuelPredicateAddresses,
  getMockedSignatureIndex,
  getProviderUrl,
} from '@fuel-connectors/common';
import { PREDICATE_VERSIONS } from '@fuel-connectors/evm-predicates';
import {
  CHAIN_IDS,
  type ConnectorMetadata,
  FuelConnectorEventTypes,
  Provider as FuelProvider,
  LocalStorage,
  type StorageAbstract,
  type TransactionRequestLike,
} from 'fuels';
import { stringToHex } from 'viem';
import type { Config } from 'wagmi';
import {
  type GetAccountReturnType,
  disconnect,
  getAccount,
  reconnect,
} from 'wagmi/actions';
import {
  ETHEREUM_ICON,
  SIGNATURE_VALIDATION_TIMEOUT,
  WINDOW,
} from './constants';
import { isWagmiAdapter } from './isWagmiAdapter';
import type { CustomCurrentConnectorEvent, PredicateEvmConfig } from './types';

export class PredicateEvm extends PredicateConnector {
  name = 'Ethereum Wallets';
  installed = true;
  events = FuelConnectorEventTypes;
  metadata: ConnectorMetadata = {
    image: ETHEREUM_ICON,
    install: {
      action: 'Install',
      description: 'Install Ethereum Wallet to connect to Fuel',
      link: 'https://ethereum.org/en/wallets/find-wallet/',
    },
  };

  private fuelProvider: FuelProvider | Promise<FuelProvider>;
  private ethProvider: EIP1193Provider | null = null;
  private config: PredicateEvmConfig;
  private storage: StorageAbstract;

  constructor(config: PredicateEvmConfig) {
    super();
    this.storage =
      config.storage || new LocalStorage(WINDOW?.localStorage as Storage);

    this.config = config;
    this.customPredicate = config.predicateConfig || null;
    const network = getProviderUrl(config?.chainId ?? CHAIN_IDS.fuel.mainnet);
    this.fuelProvider = FuelProvider.create(network);

    // @TODO: Put it back
    // if (wagmiConfig && wagmiConfig?._internal.syncConnectedChain !== false) {
    //   subscribeAndEnforceChain(wagmiConfig);
    // }

    this.loadPersistedConnection();
  }

  private async loadPersistedConnection() {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) return;
    await this.fuelProvider;
    await this.requireConnection();
    await this.handleConnect(
      getAccount(wagmiConfig),
      await this.getAccountAddress(),
    );
    return;
  }

  private async handleConnect(
    account: NonNullable<GetAccountReturnType<Config>>,
    defaultAccount: string | null = null,
  ) {
    const address = defaultAccount ?? (account?.address as string);
    if (!(await this.accountHasValidation(address))) return;
    if (!address) return;
    await this.setupPredicate();
    this.emit(this.events.connection, true);
    this.emit(
      this.events.currentAccount,
      this.predicateAccount?.getPredicateAddress(address),
    );
    this.emit(
      this.events.accounts,
      this.predicateAccount?.getPredicateAddresses(await this.walletAccounts()),
    );
  }

  private setupWatchers() {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) throw new Error('Wagmi config not found');

    // @TODO: Put it back if needed
    // this.subscribe(
    //   watchAccount(wagmiConfig, {
    //     onChange: async (account) => {
    //       switch (account.status) {
    //         case 'connected': {
    //           await this.handleConnect(account);
    //           break;
    //         }
    //         case 'disconnected': {
    //           this.emit(this.events.connection, false);
    //           this.emit(this.events.currentAccount, null);
    //           this.emit(this.events.accounts, []);
    //           break;
    //         }
    //       }
    //     },
    //   }),
    // );
  }

  protected getWagmiConfig(): Maybe<Config> {
    if (isWagmiAdapter(this.config.appkit.chainAdapters?.eip155)) {
      return this.config.appkit.chainAdapters.eip155.wagmiConfig;
    }

    return null;
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
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) return null;
    const addresses = await this.getAccountAddresses();
    if (!addresses) return null;
    const address = addresses[0];
    if (!address) return null;
    if (!(await this.accountHasValidation(address))) return null;
    return address;
  }

  protected async getAccountAddresses(): Promise<Maybe<readonly string[]>> {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) return null;
    const { addresses = [] } = getAccount(wagmiConfig);
    const accountsValidations = await this.getAccountValidations(
      addresses as `0x${string}`[],
    );
    return addresses.filter((_, i) => accountsValidations[i]);
  }

  protected async requireConnection() {
    const wagmiConfig = this.getWagmiConfig();

    if (this.config.skipAutoReconnect || !wagmiConfig) return;

    const { status, connections } = wagmiConfig.state;
    if (status === 'disconnected' && connections.size > 0) {
      await reconnect(wagmiConfig);
    }
  }

  protected async getProviders(): Promise<ProviderDictionary> {
    if (this.fuelProvider && this.ethProvider) {
      return {
        fuelProvider: await this.fuelProvider,
        ethProvider: this.ethProvider,
      };
    }

    const wagmiConfig = this.getWagmiConfig();
    const ethProvider = wagmiConfig
      ? ((await getAccount(
          wagmiConfig,
        ).connector?.getProvider?.()) as EIP1193Provider)
      : undefined;

    return {
      fuelProvider: await this.fuelProvider,
      ethProvider,
    };
  }

  public async connect(): Promise<boolean> {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) throw new Error('Wagmi config not found');

    // User might have connected already, now let's ask for the signatures
    const state = await this.requestSignatures(wagmiConfig);
    if (state === 'validated') {
      return true;
    }

    // User not connected, let's show the @reown/appkit modal
    this.config.appkit.open();
    const unsub = this.config.appkit.subscribeEvents(async (event) => {
      switch (event.data.event) {
        case 'INITIALIZE':
          this.config.appkit.open();
          break;
        case 'CONNECT_SUCCESS': {
          const { addresses = [] } = getAccount(wagmiConfig);

          let hasAccountToSign = false;
          for (const address of addresses) {
            if (await this.accountHasValidation(address)) {
              continue;
            }

            hasAccountToSign = true;
            this.storage.setItem(`SIGNATURE_VALIDATION_${address}`, 'pending');
          }

          if (hasAccountToSign) {
            const currentConnectorEvent: CustomCurrentConnectorEvent = {
              type: this.events.currentConnector,
              data: this,
              metadata: {
                pendingSignature: true,
              },
            };

            // Workaround to tell Connecting dialog that now we'll request signature
            this.emit(this.events.currentConnector, currentConnectorEvent);
          }

          unsub?.();
          break;
        }
        case 'MODAL_CLOSE':
        case 'CONNECT_ERROR': {
          unsub?.();
          break;
        }
      }
    });

    return false;
  }

  private async getAccountValidations(
    accounts: `0x${string}`[] | string[],
  ): Promise<boolean[]> {
    return Promise.all(
      accounts.map(async (a) => {
        const isValidated = await this.storage.getItem(
          `SIGNATURE_VALIDATION_${a}`,
        );
        return isValidated === 'true';
      }),
    );
  }

  private async accountHasValidation(
    account: `0x${string}` | string | undefined,
  ) {
    if (!account) return false;
    const [hasValidate] = await this.getAccountValidations([account]);
    return hasValidate;
  }

  private async requestSignatures(
    wagmiConfig: Config,
  ): Promise<'validated' | 'pending'> {
    const account = getAccount(wagmiConfig);

    const { addresses = [], isConnected } = account;
    for (const address of addresses) {
      try {
        await this.requestSignature(address);
      } catch (err) {
        this.disconnect();
        throw err;
      }
    }

    if (isConnected) {
      try {
        await this.handleConnect(account);
        return 'validated';
      } catch (err) {
        this.disconnect();
        throw err;
      }
    }

    return 'pending';
  }

  private async requestSignature(address?: string) {
    return new Promise(async (resolve, reject) => {
      const hasSignature = await this.accountHasValidation(address);
      if (hasSignature) return resolve(true);

      // Disconnect if user doesn't provide signature in time
      const validationTimeout = setTimeout(() => {
        reject(
          new Error("User didn't provide signature in less than 1 minute"),
        );
      }, SIGNATURE_VALIDATION_TIMEOUT);
      const { ethProvider } = await this.getProviders();

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

          const currentConnectorEvent: CustomCurrentConnectorEvent = {
            type: this.events.currentConnector,
            data: this,
            metadata: {
              pendingSignature: false,
            },
          };

          // Workaround to tell Connecting dialog that now we'll request connection again
          this.emit(this.events.currentConnector, currentConnectorEvent);
          reject(err);
        });
    });
  }

  public async disconnect(): Promise<boolean> {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) throw new Error('Wagmi config not found');

    const { connector, isConnected } = getAccount(wagmiConfig);
    await disconnect(wagmiConfig, {
      connector,
    });

    return isConnected || false;
  }

  public async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<string> {
    const { ethProvider, fuelProvider } = await this.getProviders();
    const { request, transactionId, account, transactionRequest } =
      await this.prepareTransaction(address, transaction);

    const signature = (await ethProvider?.request({
      method: 'personal_sign',
      params: [transactionId, account],
    })) as string;

    const predicateSignatureIndex = getMockedSignatureIndex(
      transactionRequest.witnesses,
    );

    // Transform the signature into compact form for Sway to understand
    const compactSignature = splitSignature(hexToBytes(signature)).compact;
    transactionRequest.witnesses[predicateSignatureIndex] = compactSignature;

    const transactionWithPredicateEstimated =
      await fuelProvider.estimatePredicates(request);

    const response = await fuelProvider.operations.submit({
      encodedTransaction: hexlify(
        transactionWithPredicateEstimated.toTransactionBytes(),
      ),
    });

    return response.submit.id;
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
      this.disconnect();
      throw error;
    }
  }

  async signMessageCustomCurve(message: string) {
    const { ethProvider } = await this.getProviders();
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

  static getFuelPredicateAddresses(ethAddress: string) {
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
        evmPredicate,
      }),
    );

    return predicateAddresses;
  }
}
