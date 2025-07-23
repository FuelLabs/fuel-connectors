import { FuelWalletConnector } from '@fuel-connectors/fuel-wallet';
import type { ConnectorMetadata } from 'fuels';
import { APP_IMAGE } from './constants';

export class ArcanaWalletConnector extends FuelWalletConnector {
  name = 'Arcana Wallet';
  metadata: ConnectorMetadata = {
    image: APP_IMAGE,
    install: {
      action: 'Install',
      description: 'Install Arcana Wallet in order to connect it.',
      link: 'https://chromewebstore.google.com/detail/arcana-wallet/nieddmedbnibfkfokcionggafcmcgkpi',
    },
  };

  constructor() {
    super('Arcana Wallet');
  }
}
