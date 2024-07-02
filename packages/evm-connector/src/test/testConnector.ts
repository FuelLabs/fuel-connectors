import { type Provider, bn } from 'fuels';

import {
  EthereumWalletAdapter,
  PredicateFactory,
} from '@fuel-connectors/common';
import { EVMWalletConnector } from '../index';
import type {
  EIP1193Provider,
  EVMWalletConnectorConfig,
  Predicate,
} from '../types';
import { MockProvider } from './mockProvider';
import { VERSIONS } from './mocked-versions/versions-dictionary';

export class testEVMWalletConnector extends EVMWalletConnector {
  constructor(config: EVMWalletConnectorConfig = {}) {
    super();

    this.ethProvider = config.ethProvider as EIP1193Provider;
    this.fuelProvider = config.fuelProvider as Provider;

    this.customPredicate = config.predicateConfig || null;
  }

  async getProviders() {
    if (this.fuelProvider && this.ethProvider) {
      return { fuelProvider: this.fuelProvider, ethProvider: this.ethProvider };
    }

    return {
      fuelProvider: this.fuelProvider as Provider,
      ethProvider: new MockProvider() as EIP1193Provider,
    };
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

      const { ethProvider } = await this.getProviders();

      const accounts = (await ethProvider.request({
        method: 'eth_accounts',
      })) as string[];

      const address = accounts[0] as string;

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
