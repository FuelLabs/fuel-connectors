import {
  ecrecover,
  fromRpcSig,
  hashPersonalMessage,
  hexToBytes,
  pubToAddress,
} from '@ethereumjs/util';
import { hexlify, splitSignature } from '@ethersproject/bytes';
import {
  type Config,
  type GetAccountReturnType,
  disconnect,
  getAccount,
  reconnect,
  watchAccount,
} from '@wagmi/core';
import type { Web3Modal } from '@web3modal/wagmi';
import {
  type ConnectorMetadata,
  FuelConnectorEventTypes,
  Provider as FuelProvider,
  type TransactionRequestLike,
} from 'fuels';

import {
  type EIP1193Provider,
  EthereumWalletAdapter,
  type Maybe,
  PredicateConnector,
  type PredicateVersion,
  type PredicateWalletAdapter,
  type ProviderDictionary,
  getMockedSignatureIndex,
  getOrThrow,
} from '@fuel-connectors/common';
import { PREDICATE_VERSIONS } from '@fuel-connectors/evm-predicates';
import { ApiController } from '@web3modal/core';
import {
  ETHEREUM_ICON,
  SIGNATURE_STORAGE_KEY,
  TESTNET_URL,
  WINDOW,
} from './constants';
import type { SignatureData, WalletConnectConfig } from './types';
import { createWagmiConfig, createWeb3ModalInstance } from './web3Modal';

export class WalletConnectConnector extends PredicateConnector {
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

  private fuelProvider!: FuelProvider;
  private web3Modal!: Web3Modal;
  private config: WalletConnectConfig = {} as WalletConnectConfig;
  private revalidationTimeout: NodeJS.Timeout | null = null;

  constructor(config: WalletConnectConfig) {
    super();

    const wagmiConfig = config?.wagmiConfig ?? createWagmiConfig();
    this.customPredicate = config.predicateConfig || null;
    this.configProviders({ ...config, wagmiConfig });
    this.loadPersistedConnection();
  }

  private async loadPersistedConnection() {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) return;

    await this.config?.fuelProvider;
    await this.requireConnection();
    await this.handleConnect(getAccount(wagmiConfig));
  }

  // createModal re-instanciates the modal to update singletons from web3modal
  private createModal() {
    this.clearSubscriptions();
    this.web3Modal = this.modalFactory(this.config);
    ApiController.prefetch();
    this.setupWatchers();
  }

  private modalFactory(config: WalletConnectConfig) {
    return createWeb3ModalInstance({
      projectId: config.projectId,
      wagmiConfig: config.wagmiConfig,
    });
  }

  private async handleConnect(
    account: NonNullable<GetAccountReturnType<Config>>,
  ) {
    if (!account?.address) {
      return;
    }

    await this.setupPredicate();
    await this.signAndValidate(account.address);
    this.emit(this.events.connection, true);
    this.emit(
      this.events.currentAccount,
      this.predicateAccount?.getPredicateAddress(account.address),
    );
    this.emit(
      this.events.accounts,
      this.predicateAccount?.getPredicateAddresses(await this.walletAccounts()),
    );
  }

  private setupWatchers() {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) throw new Error('Wagmi config not found');

    this.subscribe(
      watchAccount(wagmiConfig, {
        onChange: async (account) => {
          switch (account.status) {
            case 'connected': {
              await this.handleConnect(account);
              break;
            }
            case 'disconnected': {
              this.emit(this.events.connection, false);
              this.emit(this.events.currentAccount, null);
              this.emit(this.events.accounts, []);
              break;
            }
          }
        },
      }),
    );
  }

  protected getWagmiConfig(): Maybe<Config> {
    return this.config?.wagmiConfig;
  }

  protected getWalletAdapter(): PredicateWalletAdapter {
    return new EthereumWalletAdapter();
  }

  protected getPredicateVersions(): Record<string, PredicateVersion> {
    return PREDICATE_VERSIONS;
  }

  protected async configProviders(config: WalletConnectConfig = {}) {
    this.config = Object.assign(config, {
      fuelProvider: FuelProvider.create(TESTNET_URL),
    });
  }

  protected walletAccounts(): Promise<Array<string>> {
    return new Promise((resolve) => {
      resolve(this.getAccountAddresses() as Array<string>);
    });
  }

  protected getAccountAddress(): Maybe<string> {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) return null;

    return getAccount(wagmiConfig).address;
  }

  protected getAccountAddresses(): Maybe<readonly string[]> {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) return null;

    return getAccount(wagmiConfig).addresses;
  }

  protected async requireConnection() {
    const wagmiConfig = this.getWagmiConfig();
    if (!this.web3Modal) this.createModal();
    if (!wagmiConfig) return;

    const { state } = wagmiConfig;
    if (state.status === 'disconnected' && state.connections.size > 0) {
      await reconnect(wagmiConfig);
    }
  }

  protected async getProviders(): Promise<ProviderDictionary> {
    if (!this.fuelProvider) {
      this.fuelProvider = getOrThrow(
        await this.config.fuelProvider,
        'Fuel provider is not available',
      );
    }

    const wagmiConfig = this.getWagmiConfig();
    const ethProvider = wagmiConfig
      ? ((await getAccount(
          wagmiConfig,
        ).connector?.getProvider?.()) as EIP1193Provider)
      : undefined;

    return {
      fuelProvider: this.fuelProvider,
      ethProvider,
    };
  }

  private async revalidateWithCurrentAccount() {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) return;

    const account = getAccount(wagmiConfig);
    if (!account?.address || !account.isConnected) return;

    await this.signAndValidate(account.address);
  }

  public async connect(): Promise<boolean> {
    this.createModal();
    return new Promise((resolve) => {
      this.web3Modal.open();
      const wagmiConfig = this.getWagmiConfig();
      const unsub = this.web3Modal.subscribeEvents(async (event) => {
        switch (event.data.event) {
          case 'MODAL_OPEN':
            if (wagmiConfig) {
              const account = getAccount(wagmiConfig);
              this.revalidateWithCurrentAccount();
              if (account?.isConnected) {
                this.web3Modal.close();
                resolve(true);
                unsub();
                break;
              }
            }
            // Ensures that the WC Web3Modal config is applied over pre-existing states (e.g. Solan Connect Web3Modal)
            this.createModal();
            break;
          case 'CONNECT_SUCCESS': {
            this.revalidateWithCurrentAccount();
            unsub();
            resolve(true);
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
    this.revalidationTimeout && clearTimeout(this.revalidationTimeout);
    WINDOW?.localStorage.removeItem(SIGNATURE_STORAGE_KEY);
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

  private setSignatureData({ message, signature }: SignatureData) {
    const signatureData = {
      message,
      signature,
    };
    WINDOW?.localStorage.setItem(
      SIGNATURE_STORAGE_KEY,
      JSON.stringify(signatureData),
    );
    return signatureData;
  }

  private getSignatureData() {
    try {
      const signatureData =
        WINDOW?.localStorage.getItem(SIGNATURE_STORAGE_KEY) || '{}';
      if (!signatureData) {
        return null;
      }
      return JSON.parse(signatureData) as SignatureData;
    } catch (error) {
      console.error('Failed to parse signature data', error);
      return null;
    }
  }

  private validateSignature(
    account: string,
    lastAccountSignature: SignatureData,
  ) {
    if (!lastAccountSignature) {
      return false;
    }
    const { message, signature } = lastAccountSignature;
    if (!message || !signature) {
      return false;
    }
    const msgBuffer = Buffer.from(message);
    const msgHash = hashPersonalMessage(msgBuffer);
    const { v, r, s } = fromRpcSig(signature);
    const pubKey = ecrecover(msgHash, v, r, s);
    const recoveredAddress = Buffer.from(pubToAddress(pubKey)).toString('hex');

    // The recovered address doesn't have the 0x prefix
    return recoveredAddress.toLowerCase() === account.toLowerCase().slice(2);
  }

  private async signAndValidate(account: string) {
    try {
      const { ethProvider } = await this.getProviders();
      if (!ethProvider) {
        throw new Error('Ethereum provider not found');
      }

      // Check if the account is a contract (potential multi-sig)
      const code = await ethProvider.request({
        method: 'eth_getCode',
        params: [account, 'latest'],
      });

      if (code !== '0x') {
        throw new Error('Multi-signature wallets are not supported');
      }

      if (!account.startsWith('0x')) {
        throw new Error('Invalid account address');
      }

      const lastAccountSignature = this.getSignatureData();
      const connected = (await this.isConnected()) && this.connected;
      if (!connected) {
        this.revalidationTimeout = setTimeout(
          () => this.revalidateWithCurrentAccount(),
          3000,
        );
        return;
      }

      const revalidationNotRequired =
        lastAccountSignature &&
        this.validateSignature(account, lastAccountSignature);

      if (revalidationNotRequired) {
        return;
      }

      const message = `Sign this message to verify the connected account: ${account}`;
      const signature = (await ethProvider.request({
        method: 'personal_sign',
        params: [message, account],
      })) as string;

      if (!signature) {
        throw new Error('Signature not found');
      }
      const signatureData = this.setSignatureData({ message, signature });

      if (!this.validateSignature(account, signatureData)) {
        throw new Error('Signature address validation failed');
      }
    } catch (error) {
      await this.disconnect();
      throw error;
    }
  }
}
