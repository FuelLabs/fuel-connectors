import {
  type Web3Modal as SolanaWeb3Modal,
  createWeb3Modal as createSolanaWeb3Modal,
  defaultSolanaConfig,
} from '@web3modal/solana';
import type { ProviderType } from '@web3modal/solana/dist/types/src/utils/scaffold';
import { DEFAULT_CHAINS, DEFAULT_PROJECT_ID } from './constants';

interface CreateSolanaWeb3ModalProps {
  projectId?: string;
  solanaConfig: ProviderType;
}

export function createSolanaConfig(projectId = DEFAULT_PROJECT_ID) {
  return defaultSolanaConfig({
    enableInjected: true,
    chains: DEFAULT_CHAINS,
    projectId,
    metadata: {
      name: 'Web3Modal',
      description: 'Web3Modal Laboratory',
      url: 'https://lab.web3modal.com',
      icons: ['https://avatars.githubusercontent.com/u/37784886'],
    },
  });
}

export function createSolanaWeb3ModalInstance({
  projectId,
  solanaConfig,
}: CreateSolanaWeb3ModalProps): SolanaWeb3Modal {
  if (!projectId) {
    console.warn(
      '[WalletConnect Connector]: Get a project ID on https://cloud.walletconnect.com to use WalletConnect features.',
    );
  }

  return createSolanaWeb3Modal({
    solanaConfig,
    chains: DEFAULT_CHAINS,
    enableAnalytics: false,
    projectId: projectId ?? DEFAULT_PROJECT_ID,
  });
}
