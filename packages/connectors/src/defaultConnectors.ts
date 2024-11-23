import { BakoSafeConnector } from '@fuel-connectors/bako-safe';
import {
  type BurnerWalletConfig,
  BurnerWalletConnector,
} from '@fuel-connectors/burner-wallet-connector';
import { FuelWalletDevelopmentConnector } from '@fuel-connectors/fuel-development-wallet';
import { FuelWalletConnector } from '@fuel-connectors/fuel-wallet';
import { FueletWalletConnector } from '@fuel-connectors/fuelet-wallet';
import { SolanaConnector } from '@fuel-connectors/solana-connector';
import { WalletConnectConnector } from '@fuel-connectors/walletconnect-connector';
import { type Config, connect } from '@wagmi/core';
import type { ProviderType } from '@web3modal/solana/dist/types/src/utils/scaffold';
import type { FuelConfig, FuelConnector } from 'fuels';
import type { Provider as FuelProvider } from 'fuels';

type DefaultConnectors = {
  devMode?: boolean;
  wcProjectId?: string;
  burnerWalletConfig?: BurnerWalletConfig;
  ethWagmiConfig?: Config;
  ethSkipAutoReconnect?: boolean;
  solanaConfig?: ProviderType;
  chainId?: number;
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
};

export function defaultConnectors({
  devMode,
  wcProjectId,
  burnerWalletConfig,
  ethWagmiConfig,
  ethSkipAutoReconnect,
  solanaConfig: _solanaConfig,
  chainId,
  fuelProvider,
}: DefaultConnectors = {}): Array<FuelConnector> {
  const connectors: Array<FuelConnector> = [
    new FuelWalletConnector(),
    new BakoSafeConnector(),
    new FueletWalletConnector(),
  ];

  if (ethWagmiConfig) {
    connectors.push(
      new WalletConnectConnector({
        projectId: wcProjectId,
        wagmiConfig: ethWagmiConfig,
        chainId,
        fuelProvider,
        skipAutoReconnect: ethSkipAutoReconnect,
      }),
    );
  }

  if (_solanaConfig) {
    connectors.push(
      new SolanaConnector({
        projectId: wcProjectId,
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
