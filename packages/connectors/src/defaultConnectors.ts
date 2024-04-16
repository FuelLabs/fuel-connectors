import { BurnerWalletConnector } from '@fuel-connectors/burner-wallet-connector';
import { EVMWalletConnector } from '@fuel-connectors/evm-connector';
import { FuelWalletDevelopmentConnector } from '@fuel-connectors/fuel-development-wallet';
import { FuelWalletConnector } from '@fuel-connectors/fuel-wallet';
import { FueletWalletConnector } from '@fuel-connectors/fuelet-wallet';
import type { FuelConnector } from 'fuels';

type DefaultConnectors = {
  devMode?: boolean;
};

export function defaultConnectors({
  devMode,
}: DefaultConnectors = {}): Array<FuelConnector> {
  const connectors = [
    new FuelWalletConnector(),
    new FueletWalletConnector(),
    new EVMWalletConnector(),
    new BurnerWalletConnector(),
  ];

  if (devMode) {
    connectors.push(new FuelWalletDevelopmentConnector());
  }

  return connectors;
}
