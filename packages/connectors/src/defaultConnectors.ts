import { BakoSafeConnector } from '@fuel-connectors/bako-safe';
import {
  type BurnerWalletConfig,
  BurnerWalletConnector,
} from '@fuel-connectors/burner-wallet-connector';
import { FuelWalletDevelopmentConnector } from '@fuel-connectors/fuel-development-wallet';
import { FuelWalletConnector } from '@fuel-connectors/fuel-wallet';
import { FueletWalletConnector } from '@fuel-connectors/fuelet-wallet';
import { ReownConnector } from '@fuel-connectors/reown-connector';
import type { AppKit } from '@reown/appkit';

import type { FuelConnector } from 'fuels';
import type { Provider as FuelProvider } from 'fuels';

type DefaultConnectors = {
  devMode?: boolean;
  wcProjectId?: string;
  burnerWalletConfig?: BurnerWalletConfig;
  ethSkipAutoReconnect?: boolean;
  appkit: AppKit;
  chainId?: number;
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
};

export function defaultConnectors({
  devMode,
  wcProjectId,
  burnerWalletConfig,
  ethSkipAutoReconnect,
  appkit,
  chainId,
  fuelProvider,
}: DefaultConnectors): Array<FuelConnector> {
  const connectors: Array<FuelConnector> = [
    new FuelWalletConnector(),
    new BakoSafeConnector(),
    new FueletWalletConnector(),
    new ReownConnector({
      projectId: wcProjectId,
      appkit,
      chainId,
      fuelProvider,
      skipAutoReconnect: ethSkipAutoReconnect,
    }),
  ];

  if (devMode) {
    connectors.push(
      new FuelWalletDevelopmentConnector(),
      new BurnerWalletConnector({
        ...burnerWalletConfig,
        chainId,
        fuelProvider,
      }),
    );
  }

  return connectors;
}
