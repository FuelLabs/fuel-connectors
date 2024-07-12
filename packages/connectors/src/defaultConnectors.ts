import { BakoSafeConnector } from '@fuel-connectors/bako-safe';
import { BurnerWalletConnector } from '@fuel-connectors/burner-wallet-connector';
import { FuelWalletDevelopmentConnector } from '@fuel-connectors/fuel-development-wallet';
import { FuelWalletConnector } from '@fuel-connectors/fuel-wallet';
import { FueletWalletConnector } from '@fuel-connectors/fuelet-wallet';
import { WalletConnectConnector } from '@fuel-connectors/walletconnect-connector';
import type { FuelConnector } from 'fuels';
import type { BurnerWalletConfig } from '../../burner-wallet-connector/src/types';

type DefaultConnectors = {
  devMode?: boolean;
  burnerWalletConfig?: BurnerWalletConfig;
};

export function defaultConnectors({
  devMode,
  burnerWalletConfig,
}: DefaultConnectors = {}): Array<FuelConnector> {
  const connectors = [
    new FuelWalletConnector(),
    new BakoSafeConnector(),
    new FueletWalletConnector(),
    new WalletConnectConnector(),
    new BurnerWalletConnector(burnerWalletConfig),
  ];

  if (devMode) {
    connectors.push(new FuelWalletDevelopmentConnector());
  }

  return connectors;
}
