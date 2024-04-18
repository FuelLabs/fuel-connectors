import type { Provider } from 'fuels';

import { WalletConnectConnector } from '../index';

export class testWalletConnectConnector extends WalletConnectConnector {
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
