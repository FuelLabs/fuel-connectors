import { BakoSafeConnector } from '@fuel-connectors/bako-safe';
import {
  type BurnerWalletConfig,
  BurnerWalletConnector,
} from '@fuel-connectors/burner-wallet-connector';
import { FuelWalletDevelopmentConnector } from '@fuel-connectors/fuel-development-wallet';
import { FuelWalletConnector } from '@fuel-connectors/fuel-wallet';
import { FueletWalletConnector } from '@fuel-connectors/fuelet-wallet';
import {
  type PrivyAuthInterface,
  SocialConnector,
} from '@fuel-connectors/social-connector';
import { SolanaConnector } from '@fuel-connectors/solana-connector';
import { WalletConnectConnector } from '@fuel-connectors/walletconnect-connector';
import type { Config } from '@wagmi/core';
import type { ProviderType } from '@web3modal/solana/dist/types/src/utils/scaffold';
import type { FuelConnector } from 'fuels';
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
  /** Privy auth interface from usePrivy() hook for social login */
  privyAuth?: PrivyAuthInterface;
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
  privyAuth,
}: DefaultConnectors = {}): Array<FuelConnector> {
  const connectors: Array<FuelConnector> = [
    new FuelWalletConnector(),
    new BakoSafeConnector(),
    new FueletWalletConnector(),
    new WalletConnectConnector({
      projectId: wcProjectId,
      wagmiConfig: ethWagmiConfig,
      chainId,
      fuelProvider,
      skipAutoReconnect: ethSkipAutoReconnect,
    }),
    new SolanaConnector({
      projectId: wcProjectId,
      chainId,
      fuelProvider,
    }),
    new SocialConnector({
      privyAuth,
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
