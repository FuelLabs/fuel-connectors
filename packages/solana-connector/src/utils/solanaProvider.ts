import {
  type Web3Modal,
  createWeb3Modal,
  defaultSolanaConfig,
} from '@web3modal/solana';
import { SolanaChains } from '../constants';
import type { SolanaConfig } from '../types';

const DEFAULT_PROJECT_ID = '00000000000000000000000000000000';

const chains = [
  SolanaChains.MAINNET,
  SolanaChains.TESTNET,
  SolanaChains.DEVNET,
];

interface ModalConfig {
  walletConnectModal: Web3Modal;
}

export function createSolanaProvider(config: SolanaConfig): ModalConfig {
  const solanaConfig =
    config.solanaConfig ??
    defaultSolanaConfig({
      enableInjected: true,
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
    solanaConfig,
    chains,
    enableAnalytics: false,
    projectId: config.projectId ?? DEFAULT_PROJECT_ID,
  });

  return {
    walletConnectModal,
  };
}
