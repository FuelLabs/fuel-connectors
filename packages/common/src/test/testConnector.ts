import type { TransactionRequestLike } from 'fuels';

import {
  type Maybe,
  type MaybeAsync,
  PredicateConnector,
  type PredicateVersion,
  type PredicateWalletAdapter,
  type ProviderDictionary,
  type SignedMessageCustomCurve,
  SolanaWalletAdapter,
} from '../index';
import versions from './mockedPredicate';

export class TestPredicatedConnector extends PredicateConnector {
  public name = 'Predicated Connector';
  public metadata = {
    image: '',
    install: {
      action: 'Install',
      description: '',
      link: '',
    },
  };

  protected getWalletAdapter(): PredicateWalletAdapter {
    return new SolanaWalletAdapter();
  }

  protected getPredicateVersions(): Record<string, PredicateVersion> {
    return versions;
  }

  protected getAccountAddress(): MaybeAsync<Maybe<string>> {
    return Promise.resolve(null);
  }

  protected getProviders(): Promise<ProviderDictionary> {
    throw new Error('Method not implemented.');
  }

  protected requireConnection(): MaybeAsync<void> {}

  protected walletAccounts(): Promise<Array<string>> {
    return Promise.resolve([]);
  }

  public sendTransaction(
    _address: string,
    _transaction: TransactionRequestLike,
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }

  public connect(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public disconnect(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public signMessageCustomCurve(
    _message: string,
  ): Promise<SignedMessageCustomCurve> {
    throw new Error('Method not implemented.');
  }
}
