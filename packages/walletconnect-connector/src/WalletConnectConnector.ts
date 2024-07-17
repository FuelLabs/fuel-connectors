import { hexToBytes } from '@ethereumjs/util';
import { hexlify, splitSignature } from '@ethersproject/bytes';
import {
  type Config,
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
import { VERSIONS } from '../versions/versions-dictionary';
import { ETHEREUM_ICON, TESTNET_URL } from './constants';
import { createModalConfig, createWagmiConfig } from './provider';
import type { WalletConnectConfig } from './types';

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
  private wagmiConfig: Config;
  private fuelProvider!: FuelProvider;
  private web3Modal!: Web3Modal;
  private config: WalletConnectConfig = {};

  constructor(config: WalletConnectConfig = {}) {
    super();

    this.wagmiConfig = createWagmiConfig(config);
    this.customPredicate = config.predicateConfig || null;

    this.configProviders(config);
  }

  private setupWatchers() {
    this.subscribe(
      watchAccount(this.wagmiConfig, {
        onChange: async (account) => {
          const predicateAccount = this.predicateAccount;

          switch (account.status) {
            case 'connected': {
              await this.setupPredicate();

              this.emit(this.events.connection, true);
              this.emit(
                this.events.currentAccount,
                predicateAccount?.getPredicateAddress(account.address),
              );
              this.emit(
                this.events.accounts,
                predicateAccount?.getPredicateAddresses(
                  await this.walletAccounts(),
                ),
              );
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

  // createModal re-instanciates the modal to update singletons from web3modal
  private createModal() {
    this.clearSubscriptions();
    const { web3Modal } = createModalConfig(this.config);
    this.web3Modal = web3Modal;
    ApiController.prefetch();
    this.setupWatchers();
  }

  protected getWalletAdapter(): PredicateWalletAdapter {
    return new EthereumWalletAdapter();
  }

  protected getPredicateVersions(): Record<string, Predicate> {
    return VERSIONS;
  }

  protected async configProviders(config: WalletConnectConfig = {}) {
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || FuelProvider.create(TESTNET_URL),
    });
  }

  protected walletAccounts(): Promise<Array<string>> {
    return new Promise((resolve) => {
      const accounts = getAccount(this.wagmiConfig).addresses;
      resolve(accounts as Array<string>);
    });
  }

  protected getAccountAddress(): Maybe<string> {
    return getAccount(this.wagmiConfig).address;
  }

  protected async requireConnection() {
    if (!this.web3Modal) this.createModal();
    if (!this.wagmiConfig) return;

    const { state } = this.wagmiConfig;
    if (state.status === 'disconnected' && state.connections.size > 0) {
      await reconnect(this.wagmiConfig);
    }
  }

  protected async getProviders(): Promise<ProviderDictionary> {
    if (!this.fuelProvider) {
      this.fuelProvider = getOrThrow(
        await this.config.fuelProvider,
        'Fuel provider is not available',
      );
    }

    const ethProvider = (await getAccount(
      this.wagmiConfig,
    ).connector?.getProvider()) as EIP1193Provider;

    return {
      fuelProvider: this.fuelProvider,
      ethProvider,
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
    const { connector, isConnected } = getAccount(this.wagmiConfig);
    await disconnect(this.wagmiConfig, {
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
