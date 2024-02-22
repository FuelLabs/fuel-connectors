import { FuelWalletDevelopmentConnector } from '@fuel-connectors/fuel-development-wallet';
import { FuelWalletConnector } from '@fuel-connectors/fuel-wallet';
import { FueletWalletConnector } from '@fuel-connectors/fuelet-wallet';

type DefaultConnectors = {
  devMode?: boolean;
};

export function defaultConnectors({ devMode }: DefaultConnectors = {}) {
  const connectors = [new FuelWalletConnector(), new FueletWalletConnector()];
  if (devMode) {
    connectors.push(new FuelWalletDevelopmentConnector());
  }
  return connectors;
}
