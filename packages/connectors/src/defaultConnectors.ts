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
import type { Config } from '@wagmi/core';
import type { ProviderType } from '@web3modal/solana/dist/types/src/utils/scaffold';
import type { FuelConnector } from 'fuels';

type DefaultConnectors = {
  devMode?: boolean;
  wcProjectId?: string;
  burnerWalletConfig?: BurnerWalletConfig;
  ethWagmiConfig?: Config;
  solanaConfig?: ProviderType;
  chainId?: number;
};

export function defaultConnectors({
  devMode,
  wcProjectId,
  burnerWalletConfig,
  ethWagmiConfig,
  solanaConfig: _solanaConfig,
  chainId,
}: DefaultConnectors = {}): Array<FuelConnector> {
  const connectors: Array<FuelConnector> = [
    new FuelWalletConnector(),
    new BakoSafeConnector(),
    new FueletWalletConnector(),
    new WalletConnectConnector({
      projectId: wcProjectId,
      wagmiConfig: ethWagmiConfig,
      chainId,
    }),
    new SolanaConnector({
      projectId: wcProjectId,
      chainId,
    }),
  ];

  if (devMode) {
    connectors.push(
      new FuelWalletDevelopmentConnector(),
      new BurnerWalletConnector({ ...burnerWalletConfig, chainId }),
    );
  }

  return connectors;
}
