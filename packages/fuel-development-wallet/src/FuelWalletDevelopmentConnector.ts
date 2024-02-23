import { FuelWalletConnector } from '@fuel-connectors/fuel-wallet';
import type { ConnectorMetadata } from 'fuels';

export class FuelWalletDevelopmentConnector extends FuelWalletConnector {
  metadata: ConnectorMetadata = {
    image: '/connectors/fuel-wallet-dev.svg',
    install: {
      action: 'Install',
      description:
        'To connect your Fuel Wallet, you need to install the browser extension first.',
      link: 'https://chrome.google.com/webstore/detail/fuel-wallet-development/hcgmehahnlbhpilepakbdinkhhaackmc',
    },
  };

  constructor() {
    super('Fuel Wallet Development');
  }
}
