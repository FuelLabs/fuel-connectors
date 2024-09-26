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
import { type FuelConnector, Provider } from 'fuels';
import { TESTNET_URL } from './constants';

type DefaultConnectors = {
  devMode?: boolean;
  wcProjectId?: string;
  burnerWalletConfig?: BurnerWalletConfig;
  ethWagmiConfig?: Config;
  solanaConfig?: ProviderType;
  providerUrl?: string;
};

export function defaultConnectors({
  devMode,
  wcProjectId,
  burnerWalletConfig,
  ethWagmiConfig,
  solanaConfig: _solanaConfig,
  providerUrl,
}: DefaultConnectors = {}): Array<FuelConnector> {
  const connectors: Array<FuelConnector> = [
    new FuelWalletConnector(),
    new BakoSafeConnector(),
    new FueletWalletConnector(),
    new WalletConnectConnector({
      projectId: wcProjectId,
      wagmiConfig: ethWagmiConfig,
      providerUrl,
    }),
    new SolanaConnector({
      projectId: wcProjectId,
      providerUrl,
    }),
  ];

  if (devMode) {
    connectors.push(
      new FuelWalletDevelopmentConnector(),
      new BurnerWalletConnector({ ...burnerWalletConfig, providerUrl }),
    );
  }

  return connectors;
}
