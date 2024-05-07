import type { Provider } from 'fuels';

import { EVMWalletConnector } from '../index';
import type { EVMWalletConnectorConfig, PredicateConfig } from '../types';
import type { EIP1193Provider } from '../utils/eip-1193';
import { MockProvider } from './mockProvider';

export class testEVMWalletConnector extends EVMWalletConnector {
  constructor(config: EVMWalletConnectorConfig = {}) {
    super();

    this.ethProvider = config.ethProvider as EIP1193Provider;
    this.fuelProvider = config.fuelProvider as Provider;

    this.predicate = config.predicateConfig || null;
    this.predicateAccount = this.setupPredicate();
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
}
