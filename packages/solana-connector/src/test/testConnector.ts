import type { Provider } from 'fuels';

import { SolanaConnector } from '../index';

export class testWalletConnectConnector extends SolanaConnector {
  constructor(fuelProvider: Provider) {
    super();
    this.fuelProvider = fuelProvider;
  }

  async getProviders() {
    if (this.fuelProvider) {
      return { fuelProvider: this.fuelProvider };
    }
    throw 'Providers must exists';
  }
}
