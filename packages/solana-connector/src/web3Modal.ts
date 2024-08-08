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
/**
 * Get the wallet ids from the explorer:
 * https://explorer.walletconnect.com/?type=wallet
 */
const wallets = [
  {
    id: 'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393',
    isInstalled: (): boolean => {
      return typeof window !== 'undefined' && !!window.phantom?.solana;
    },
  },
  {
    id: '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
    isInstalled: (): boolean => {
      return typeof window !== 'undefined' && !!window.trustWallet?.solana;
    },
  },
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

  const featuredWalletIds = wallets
    .filter((wallet) => !wallet.isInstalled())
    .map((wallet) => wallet.id);

  return createSolanaWeb3Modal({
    solanaConfig,
    chains: DEFAULT_CHAINS,
    enableAnalytics: false,
    projectId: projectId ?? DEFAULT_PROJECT_ID,
    featuredWalletIds,
  });
}
