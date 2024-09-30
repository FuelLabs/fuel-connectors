import { http, type Config, createConfig, injected } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';
import { createWeb3Modal } from '@web3modal/wagmi';
import { DEFAULT_PROJECT_ID } from './constants';

interface CreateWeb3ModalProps {
  wagmiConfig: Config | undefined;
  projectId?: string;
}

export const createWagmiConfig = (): Config =>
  createConfig({
    chains: [sepolia, mainnet],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
    connectors: [injected({ shimDisconnect: false })],
  });

export function createWeb3ModalInstance({
  wagmiConfig,
  projectId = DEFAULT_PROJECT_ID,
}: CreateWeb3ModalProps): ReturnType<typeof createWeb3Modal> {
  if (!projectId) {
    console.warn(
      '[WalletConnect Connector]: Get a project ID on https://cloud.walletconnect.com to use WalletConnect features.',
    );
  }

  return createWeb3Modal({
    wagmiConfig: {
      ...wagmiConfig,
      // @ts-ignore
      enableWalletConnect: !!projectId,
    },
    enableAnalytics: false,
    allowUnsupportedChain: true,
    projectId: projectId,
  });
}
