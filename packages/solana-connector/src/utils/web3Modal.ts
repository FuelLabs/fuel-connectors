import {
  type Web3Modal as SolanaWeb3Modal,
  createWeb3Modal as createSolanaWeb3Modal,
} from '@web3modal/solana';
import type { ProviderType } from '@web3modal/solana/dist/types/src/utils/scaffold';
import { DEFAULT_CHAINS, DEFAULT_PROJECT_ID } from '../constants';

interface CreateSolanaWeb3ModalProps {
  projectId?: string;
  solanaConfig: ProviderType;
}

const FEATURED_WALLET_IDS = [
  'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
];

export function createSolanaWeb3ModalInstance({
  projectId,
  solanaConfig,
}: CreateSolanaWeb3ModalProps): SolanaWeb3Modal {
  if (!projectId) {
    console.warn(
      '[WalletConnect Connector]: Get a project ID on https://cloud.walletconnect.com to use WalletConnect features.',
    );
  }

  const hasPhantom = typeof window !== 'undefined' && window.phantom;
  const featuredWalletIds = hasPhantom ? undefined : FEATURED_WALLET_IDS;

  return createSolanaWeb3Modal({
    solanaConfig,
    chains: DEFAULT_CHAINS,
    enableAnalytics: false,
    projectId: projectId ?? DEFAULT_PROJECT_ID,
    featuredWalletIds,
  });
}
