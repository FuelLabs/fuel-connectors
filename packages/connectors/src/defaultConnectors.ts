import { EthereumWalletConnector } from '@fuel-connectors/ethereum-connector';
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
    new EthereumWalletConnector(),
  ];

  if (devMode) {
    connectors.push(new FuelWalletDevelopmentConnector());
  }

  return connectors;
}
