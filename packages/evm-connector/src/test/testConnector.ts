import type { Provider } from 'fuels';

import { EVMWalletConnector } from '../index';
import type { EIP1193Provider } from '../utils/eip-1193';

export class testEVMWalletConnector extends EVMWalletConnector {
  constructor(ethProvider: EIP1193Provider, fuelProvider: Provider) {
    super();
    this.ethProvider = ethProvider;
    this.fuelProvider = fuelProvider;
  }

  async getProviders() {
    if (this.fuelProvider && this.ethProvider) {
      return { fuelProvider: this.fuelProvider, ethProvider: this.ethProvider };
    }
    throw 'Providers must exists';
  }
}
