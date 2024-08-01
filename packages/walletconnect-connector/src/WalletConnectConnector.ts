import { hexToBytes } from '@ethereumjs/util';
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
  type Predicate,
  PredicateConnector,
  type PredicateWalletAdapter,
  type ProviderDictionary,
  getOrThrow,
  getSignatureIndex,
} from '@fuel-connectors/common';
import { ApiController } from '@web3modal/core';
import { ETHEREUM_ICON, TESTNET_URL } from './constants';
import hex from './generated/predicates/VerificationPredicateAbi.hex';
import { VerificationPredicateAbi__factory } from './generated/predicates/factories/VerificationPredicateAbi__factory';
import type { WalletConnectConfig } from './types';
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

  protected getPredicate(): Predicate {
    return {
      abi: VerificationPredicateAbi__factory.abi,
      bytecode: hexToBytes(hex),
    };
  }

  protected async configProviders(config: WalletConnectConfig = {}) {
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || FuelProvider.create(TESTNET_URL),
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
        ).connector?.getProvider()) as EIP1193Provider)
      : undefined;

    return {
      fuelProvider: this.fuelProvider,
      ethProvider,
    };
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

    const predicateSignatureIndex = getSignatureIndex(
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
}
