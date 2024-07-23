import { BakoSafeConnector } from '@fuel-connectors/bako-safe';
import { BurnerWalletConnector } from '@fuel-connectors/burner-wallet-connector';
import { FuelWalletDevelopmentConnector } from '@fuel-connectors/fuel-development-wallet';
import { FuelWalletConnector } from '@fuel-connectors/fuel-wallet';
import { FueletWalletConnector } from '@fuel-connectors/fuelet-wallet';
import {
  SolanaConnector,
  createSolanaConfig,
  createSolanaWeb3ModalInstance,
} from '@fuel-connectors/solana-connector';
import {
  WalletConnectConnector,
  createWagmiConfig,
} from '@fuel-connectors/walletconnect-connector';
import type { Config } from '@wagmi/core';
import type { ProviderType } from '@web3modal/solana/dist/types/src/utils/scaffold';
import type { FuelConnector } from 'fuels';
import type { BurnerWalletConfig } from '../../burner-wallet-connector/src/types';
import { DEFAULT_WC_PROJECT_ID } from './constants';
import { createWeb3ModalInstance } from './web3Modal';

type DefaultConnectors = {
  devMode?: boolean;
  wcProjectId?: string;
  burnerWalletConfig?: BurnerWalletConfig;
  ethWagmiConfig?: Config;
  solanaConfig?: ProviderType;
};

export function defaultConnectors({
  devMode,
  wcProjectId = DEFAULT_WC_PROJECT_ID,
  burnerWalletConfig,
  ethWagmiConfig,
  solanaConfig: _solanaConfig,
}: DefaultConnectors = {}): Array<FuelConnector> {
  const solanaConfig = _solanaConfig || createSolanaConfig(wcProjectId);

  const solanaWeb3Modal = createSolanaWeb3ModalInstance({
    projectId: wcProjectId,
    solanaConfig,
  });
  const wagmiConfig = ethWagmiConfig || createWagmiConfig();
  const web3Modal = createWeb3ModalInstance({
    wagmiConfig,
    projectId: wcProjectId,
  });

  const connectors: Array<FuelConnector> = [
    new FuelWalletConnector(),
    new BakoSafeConnector(),
    new FueletWalletConnector(),
    new WalletConnectConnector({
      projectId: wcProjectId,
      wagmiConfig: ethWagmiConfig,
      web3Modal,
    }),
    new SolanaConnector({
      projectId: wcProjectId,
      web3Modal: solanaWeb3Modal,
    }),
    new BurnerWalletConnector(burnerWalletConfig),
  ];

  if (devMode) {
    connectors.push(new FuelWalletDevelopmentConnector());
  }

  return connectors;
}
