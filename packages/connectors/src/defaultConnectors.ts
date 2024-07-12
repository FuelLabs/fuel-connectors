import { BakoSafeConnector } from '@fuel-connectors/bako-safe';
import { BurnerWalletConnector } from '@fuel-connectors/burner-wallet-connector';
import { FuelWalletDevelopmentConnector } from '@fuel-connectors/fuel-development-wallet';
import { FuelWalletConnector } from '@fuel-connectors/fuel-wallet';
import { FueletWalletConnector } from '@fuel-connectors/fuelet-wallet';
import { WalletConnectConnector } from '@fuel-connectors/walletconnect-connector';
import type { FuelConnector } from 'fuels';

const DEFAULT_WC_PROJECT_ID = '00000000000000000000000000000000';

type DefaultConnectors = {
  devMode?: boolean;
  wcProjectId?: string;
};

export function defaultConnectors({
  devMode,
  wcProjectId = DEFAULT_WC_PROJECT_ID,
}: DefaultConnectors = {}): Array<FuelConnector> {
  const connectors = [
    new FuelWalletConnector(),
    new BakoSafeConnector(),
    new FueletWalletConnector(),
    new WalletConnectConnector({
      projectId: wcProjectId,
    }),
    new BurnerWalletConnector(),
  ];

  if (devMode) {
    connectors.push(new FuelWalletDevelopmentConnector());
  }

  return connectors;
}
