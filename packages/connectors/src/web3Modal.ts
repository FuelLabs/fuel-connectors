import type { Config } from '@wagmi/core';
import type { ProviderType } from '@web3modal/solana/dist/types/src/utils/scaffold';
import { type Web3Modal, createWeb3Modal } from '@web3modal/wagmi';
import { DEFAULT_WC_PROJECT_ID } from './constants';

interface CreateWeb3ModalProps {
  wagmiConfig: Config | undefined;
  projectId?: string;
}

export function createWeb3ModalInstance({
  wagmiConfig,
  projectId,
}: CreateWeb3ModalProps): Web3Modal {
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
    projectId: projectId ?? DEFAULT_WC_PROJECT_ID,
  });
}
