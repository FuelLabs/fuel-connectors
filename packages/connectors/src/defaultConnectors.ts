import { BakoSafeConnector } from '@fuel-connectors/bako-safe';
import {
  type BurnerWalletConfig,
  BurnerWalletConnector,
} from '@fuel-connectors/burner-wallet-connector';
import { FuelWalletDevelopmentConnector } from '@fuel-connectors/fuel-development-wallet';
import { FuelWalletConnector } from '@fuel-connectors/fuel-wallet';
import { FueletWalletConnector } from '@fuel-connectors/fuelet-wallet';
import { SolanaConnector } from '@fuel-connectors/solana-connector';
import {
  type AppKitConfig,
  WalletConnectConnector,
} from '@fuel-connectors/walletconnect-connector';
import type { FuelConnector } from 'fuels';
import type { Provider as FuelProvider } from 'fuels';

type DefaultConnectors = {
  devMode?: boolean;
  wcProjectId?: string;
  burnerWalletConfig?: BurnerWalletConfig;
  // solanaConfig?: ProviderType;
  chainId?: number;
  appKit?: AppKitConfig;
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
  ethSkipAutoReconnect?: boolean;
};

export function defaultConnectors({
  devMode,
  wcProjectId,
  burnerWalletConfig,
  appKit,
  ethSkipAutoReconnect,
  // solanaConfig: _solanaConfig,
  chainId,
  fuelProvider,
}: DefaultConnectors = {}): Array<FuelConnector> {
  const connectors: Array<FuelConnector> = [
    new FuelWalletConnector(),
    new BakoSafeConnector(),
    new FueletWalletConnector(),
    new WalletConnectConnector({
      projectId: wcProjectId,
      appKit,
      chainId,
      fuelProvider,
      skipAutoReconnect: ethSkipAutoReconnect,
    }),
    new SolanaConnector({
      projectId: wcProjectId,
      chainId,
      fuelProvider,
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
