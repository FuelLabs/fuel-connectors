import {
  type ConnectorConfig,
  type EIP1193Provider,
  EthereumWalletAdapter,
  type Maybe,
  type MaybeAsync,
  PredicateConnector,
  type PredicateVersion,
  type PredicateWalletAdapter,
  type ProviderDictionary,
  type SignedMessageCustomCurve,
  getMockedSignatureIndex,
  getOrThrow,
  getProviderUrl,
} from '@fuel-connectors/common';
import Capsule, { Environment } from '@usecapsule/web-sdk';
import {
  type Config,
  type GetAccountReturnType,
  disconnect,
  getAccount,
  reconnect,
  watchAccount,
} from '@wagmi/core';
import {
  CHAIN_IDS,
  type ConnectorMetadata,
  FuelConnectorEventTypes,
  Provider as FuelProvider,
  LocalStorage,
  type StorageAbstract,
  type TransactionRequestLike,
} from 'fuels';
import { CAPSULE_ICON, WINDOW } from './constants';
import type { CapsuleConfig } from './types';

export class CapsuleConnector extends PredicateConnector {
  sendTransaction(
    _address: string,
    _transaction: TransactionRequestLike,
  ): Promise<string> {
    throw new Error('sendTransaction not implemented.');
  }
  connect(): Promise<boolean> {
    alert('connect');
    throw new Error('connec2t not implemented.');
  }
  disconnect(): Promise<boolean> {
    throw new Error('disconnect not implemented.');
  }
  protected configProviders(_config: ConnectorConfig): MaybeAsync<void> {
    throw new Error('configProviders not implemented.');
  }
  protected getWalletAdapter(): PredicateWalletAdapter {
    throw new Error('getWalletAdapter not implemented.');
  }
  protected getPredicateVersions(): Record<string, PredicateVersion> {
    throw new Error('getPredicateVersions not implemented.');
  }
  protected getAccountAddress(): MaybeAsync<Maybe<string>> {
    throw new Error('getAccountAddress not implemented.');
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

  private providerFactory(config?: CapsuleConfig) {
    const network = getProviderUrl(config?.chainId ?? CHAIN_IDS.fuel.testnet);
    return config?.fuelProvider || FuelProvider.create(network);
  }

  protected async requireConnection() {
    await this.capsule.init();
  }
  protected walletAccounts(): Promise<Array<string>> {
    throw new Error('walletAccounts not implemented.');
  }
  signMessageCustomCurve(_message: string): Promise<SignedMessageCustomCurve> {
    throw new Error('signMessageCustomCurve not implemented.');
  }
  name = 'Capsule';
  installed = true;
  events = FuelConnectorEventTypes;
  metadata: ConnectorMetadata = {
    image: CAPSULE_ICON,
    install: {
      action: 'Install',
      description: 'Connect with Capsule',
      link: 'https://usecapsule.com',
    },
  };

  private fuelProvider!: FuelProvider;
  private ethProvider!: EIP1193Provider;
  private config: CapsuleConfig = {};
  private capsule: Capsule;

  constructor(config: CapsuleConfig) {
    super();
    this.capsule = new Capsule(
      config.environment || Environment.BETA,
      config.apiKey,
    );
  }
}
