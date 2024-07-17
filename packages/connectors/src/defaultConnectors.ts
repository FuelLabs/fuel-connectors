import { BakoSafeConnector } from '@fuel-connectors/bako-safe';
import { BurnerWalletConnector } from '@fuel-connectors/burner-wallet-connector';
import { FuelWalletDevelopmentConnector } from '@fuel-connectors/fuel-development-wallet';
import { FuelWalletConnector } from '@fuel-connectors/fuel-wallet';
import { FueletWalletConnector } from '@fuel-connectors/fuelet-wallet';
import { SolanaConnector } from '@fuel-connectors/solana-connector';
import { WalletConnectConnector } from '@fuel-connectors/walletconnect-connector';
import type { Config } from '@wagmi/core';
import type { FuelConnector } from 'fuels';
import type { BurnerWalletConfig } from '../../burner-wallet-connector/src/types';

const DEFAULT_WC_PROJECT_ID = '00000000000000000000000000000000';

type DefaultConnectors = {
  devMode?: boolean;
  wcProjectId?: string;
  burnerWalletConfig?: BurnerWalletConfig;
  ethWagmiConfig?: Config;
};

export function defaultConnectors({
  devMode,
  wcProjectId = DEFAULT_WC_PROJECT_ID,
  burnerWalletConfig,
  ethWagmiConfig,
}: DefaultConnectors = {}): Array<FuelConnector> {
  const connectors = [
    new FuelWalletConnector(),
    new BakoSafeConnector(),
    new FueletWalletConnector(),
    new WalletConnectConnector({
      projectId: wcProjectId,
      wagmiConfig: ethWagmiConfig,
    }),
    new SolanaConnector({
      projectId: wcProjectId,
    }),
    new BurnerWalletConnector(burnerWalletConfig),
  ];

  if (devMode) {
    connectors.push(new FuelWalletDevelopmentConnector());
  }

  return connectors;
}
