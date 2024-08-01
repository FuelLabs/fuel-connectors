import type { Provider } from 'fuels';

import { WalletConnectConnector } from '../index';

export class testWalletConnectConnector extends WalletConnectConnector {
  constructor(fuelProvider: Provider) {
    super({ fuelProvider });
  }
}
