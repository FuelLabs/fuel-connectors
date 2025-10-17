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

  protected _config_providers(_config: ConnectorConfig): MaybeAsync<void> {
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

  protected _get_providers(): Promise<ProviderDictionary> {
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

  protected _sign_message(_message: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  protected _get_current_evm_address(): Maybe<string> {
    return '0x1111111111111111111111111111111111111111';
  }

  protected _require_connection(): MaybeAsync<void> {
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
