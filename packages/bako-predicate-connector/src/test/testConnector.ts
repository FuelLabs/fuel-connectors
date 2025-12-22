import { versions } from 'bakosafe';
import type { TransactionRequestLike, TransactionResponse } from 'fuels';
import {
  type ConnectorConfig,
  type Maybe,
  type MaybeAsync,
  PredicateConnector,
  type PredicateVersion,
  type PredicateWalletAdapter,
  type ProviderDictionary,
  type SignedMessageCustomCurve,
  SolanaWalletAdapter,
} from '../index';

export class TestPredicatedConnector extends PredicateConnector {
  public name = 'Bako Predicated Connector';
  public metadata = {
    image: '',
    install: {
      action: 'Install',
      description: '',
      link: '',
    },
  };

  protected _configProviders(_config: ConnectorConfig): MaybeAsync<void> {
    throw new Error('Method not implemented.');
  }

  protected getWalletAdapter(): PredicateWalletAdapter {
    return new SolanaWalletAdapter();
  }

  protected getPredicateVersions(): Record<string, PredicateVersion> {
    return Object.entries(versions).reduce<Record<string, PredicateVersion>>(
      (acc, [key, { abi, bytecode, time }]) => {
        acc[key] = {
          predicate: { abi, bin: bytecode },
          generatedAt: time,
        };
        return acc;
      },
      {},
    );
  }

  protected getAccountAddress(): MaybeAsync<Maybe<string>> {
    return Promise.resolve(null);
  }

  protected _getProviders(): Promise<ProviderDictionary> {
    throw new Error('Method not implemented.');
  }

  protected requireConnection(): MaybeAsync<void> {}

  protected walletAccounts(): Promise<Array<string>> {
    return Promise.resolve([]);
  }

  public sendTransaction(
    _address: string,
    _transaction: TransactionRequestLike,
  ): Promise<TransactionResponse> {
    throw new Error('Method not implemented.');
  }

  protected _signMessage(_message: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  protected _getCurrentEvmAddress(): Maybe<string> {
    return '0x1111111111111111111111111111111111111111';
  }

  protected _requireConnection(): MaybeAsync<void> {
    throw new Error('Method not implemented.');
  }

  protected _connect(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  protected _disconnect(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public signMessageCustomCurve(
    _message: string,
  ): Promise<SignedMessageCustomCurve> {
    throw new Error('Method not implemented.');
  }
}
