import { http, type Config, createConfig, injected } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';
import { type Web3Modal, createWeb3Modal } from '@web3modal/wagmi';
import type { WalletConnectConfig } from '../types';

interface ModalConfig {
  wagmiConfig: Config;
  web3Modal: Web3Modal;
}

export const createWagmiConfig = (config: WalletConnectConfig): Config =>
  config.wagmiConfig ??
  createConfig({
    chains: [sepolia, mainnet],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
    connectors: [injected({ shimDisconnect: false })],
  });

export function createModalConfig(config: WalletConnectConfig): ModalConfig {
  const wagmiConfig = createWagmiConfig(config);

  if (!config.projectId) {
    console.warn(
      '[WalletConnect Connector]: Get a project ID on https://cloud.walletconnect.com to use WalletConnect features.',
    );
  }

  return {
    wagmiConfig,
    web3Modal: createWeb3Modal({
      wagmiConfig: {
        ...wagmiConfig,
        // @ts-ignore
        enableWalletConnect: !!config.projectId,
      },
      enableAnalytics: false,
      projectId: config.projectId ?? '00000000000000000000000000000000',
    }),
  };
}
