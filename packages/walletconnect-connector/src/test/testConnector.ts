import { type Provider, bn } from 'fuels';

import {
  EthereumWalletAdapter,
  type Predicate,
  PredicateFactory,
} from '@fuel-connectors/common';
import { getAccount } from '@wagmi/core';
import { WalletConnectConnector } from '../index';
import { VERSIONS } from './mocked-versions/versions-dictionary';

export class testWalletConnectConnector extends WalletConnectConnector {
  constructor(fuelProvider: Provider) {
    super();
    // @ts-ignore
    this.fuelProvider = fuelProvider;
  }

  async getProviders() {
    // @ts-ignore
    if (this.fuelProvider) {
      // @ts-ignore
      return { fuelProvider: this.fuelProvider };
    }
    throw 'Providers must exists';
  }

  async setupPredicate(): Promise<PredicateFactory> {
    if (this.customPredicate?.abi && this.customPredicate?.bytecode) {
      this.predicateAccount = new PredicateFactory(
        new EthereumWalletAdapter(),
        this.customPredicate,
      );
      this.predicateAddress = 'custom';

      return this.predicateAccount;
    }

    const predicateVersions = Object.entries(VERSIONS).map(([key, pred]) => ({
      pred,
      key,
    }));

    let predicateWithBalance: Predicate | null = null;

    for (const predicateVersion of predicateVersions) {
      const predicateInstance = new PredicateFactory(
        new EthereumWalletAdapter(),
        {
          abi: predicateVersion.pred.predicate.abi,
          bytecode: predicateVersion.pred.predicate.bytecode,
        },
      );

      // @ts-ignore
      const account = getAccount(this.wagmiConfig);
      const address = account.address;

      if (!address) {
        continue;
      }

      const { fuelProvider } = await this.getProviders();
      const predicate = predicateInstance.build(address, fuelProvider, [1]);

      const balance = await predicate.getBalance();

      if (balance.toString() !== bn(0).toString()) {
        predicateWithBalance = predicateVersion.pred;
        this.predicateAddress = predicateVersion.key;

        break;
      }
    }

    if (predicateWithBalance) {
      this.predicateAccount = new PredicateFactory(
        new EthereumWalletAdapter(),
        {
          abi: predicateWithBalance.predicate.abi,
          bytecode: predicateWithBalance.predicate.bytecode,
        },
      );

      return this.predicateAccount;
    }

    const newestPredicate = predicateVersions.sort(
      (a, b) => Number(b.pred.generatedAt) - Number(a.pred.generatedAt),
    )[0];

    if (newestPredicate) {
      this.predicateAccount = new PredicateFactory(
        new EthereumWalletAdapter(),
        {
          abi: newestPredicate.pred.predicate.abi,
          bytecode: newestPredicate.pred.predicate.bytecode,
        },
      );
      this.predicateAddress = newestPredicate.key;

      return this.predicateAccount;
    }

    throw new Error('No predicate found');
  }
}
