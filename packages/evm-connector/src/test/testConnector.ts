import type { Provider } from 'fuels';

import { EVMWalletConnector } from '../index';
import type { EIP1193Provider, EVMWalletConnectorConfig } from '../types';
import { MockProvider } from './mockProvider';

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
}
