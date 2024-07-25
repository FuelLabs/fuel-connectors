import type { Config } from '@wagmi/core';
import { type Web3Modal, createWeb3Modal } from '@web3modal/wagmi';
import { DEFAULT_PROJECT_ID } from '../constants';

interface CreateWeb3ModalProps {
  wagmiConfig: Config | undefined;
  projectId?: string;
}

export function createWeb3ModalInstance({
  wagmiConfig,
  projectId = DEFAULT_PROJECT_ID,
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
    projectId: projectId,
  });
}
