import { BakoSafeConnector } from '@fuel-connectors/bako-safe';
import {
  type BurnerWalletConfig,
  BurnerWalletConnector,
} from '@fuel-connectors/burner-wallet-connector';
import { FuelWalletDevelopmentConnector } from '@fuel-connectors/fuel-development-wallet';
import { FuelWalletConnector } from '@fuel-connectors/fuel-wallet';
import { FueletWalletConnector } from '@fuel-connectors/fuelet-wallet';
import {
  ReownEvmConnector,
  ReownSvmConnector,
} from '@fuel-connectors/reown-connector';
import type { AppKit } from '@reown/appkit';

import type { FuelConnector } from 'fuels';
import type { Provider as FuelProvider } from 'fuels';

type DefaultConnectors = {
  devMode?: boolean;
  burnerWalletConfig?: BurnerWalletConfig;
  appkit?: AppKit;
  chainId?: number;
  fuelProvider?: FuelProvider;
};

export function defaultConnectors({
  devMode,
  burnerWalletConfig,
  appkit,
  chainId,
  fuelProvider,
}: DefaultConnectors): Array<FuelConnector> {
  const connectors: Array<FuelConnector> = [
    new FuelWalletConnector(),
    new BakoSafeConnector(),
    new FueletWalletConnector(),
  ];

  if (appkit) {
    connectors.push(
      new ReownEvmConnector({
        appkit,
        chainId,
        fuelProvider,
      }),
      new ReownSvmConnector({
        appkit,
        chainId,
        fuelProvider,
      }),
    );
  }

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
