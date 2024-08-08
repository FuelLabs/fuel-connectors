import { defaultSolanaConfig } from '@web3modal/solana';
import { DEFAULT_CHAINS, DEFAULT_PROJECT_ID } from '../constants';

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
