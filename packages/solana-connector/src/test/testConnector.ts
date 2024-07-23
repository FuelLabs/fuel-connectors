import type { Provider } from 'fuels';

import {
  DEFAULT_PROJECT_ID,
  SolanaConnector,
  createSolanaConfig,
  createSolanaWeb3ModalInstance,
} from '../index';

export class testWalletConnectConnector extends SolanaConnector {
  constructor(fuelProvider: Provider) {
    const solanaConfig = createSolanaConfig(DEFAULT_PROJECT_ID);
    const web3Modal = createSolanaWeb3ModalInstance({
      projectId: DEFAULT_PROJECT_ID,
      solanaConfig,
    });
    super({
      fuelProvider: fuelProvider,
      solanaConfig,
      projectId: DEFAULT_PROJECT_ID,
      web3Modal,
    });
    this.fuelProvider = fuelProvider;
  }

  async getProviders() {
    if (this.fuelProvider) {
      return { fuelProvider: this.fuelProvider };
    }
    throw 'Providers must exists';
  }
}
