import {
  type Web3Modal,
  createWeb3Modal,
  defaultSolanaConfig,
} from '@web3modal/solana';
import { SolanaChains } from '../constants';
import type { SolanaConfig } from '../types';

const DEFAULT_PROJECT_ID = 'a424aaaa79c1949c6bf08f3c0874bed3';

const chains = [
  SolanaChains.MAINNET,
  SolanaChains.TESTNET,
  SolanaChains.DEVNET,
];

interface ModalConfig {
  walletConnectModal: Web3Modal;
}

export function createSolanaProvider(config: SolanaConfig): ModalConfig {
  const solanaConfig = defaultSolanaConfig({
    chains,
    projectId: config.projectId ?? DEFAULT_PROJECT_ID,
    metadata: {
      name: 'Web3Modal',
      description: 'Web3Modal Laboratory',
      url: 'https://lab.web3modal.com',
      icons: ['https://avatars.githubusercontent.com/u/37784886'],
    },
  });

  const walletConnectModal = createWeb3Modal({
    solanaConfig: {
      ...solanaConfig,
      // @ts-ignore
      enableWalletConnect: !!config.projectId,
    },
    chains,
    enableAnalytics: false,
    projectId: config.projectId ?? DEFAULT_PROJECT_ID,
  });

  return {
    walletConnectModal,
  };
}
