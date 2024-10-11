import { type Metadata, createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { DEFAULT_NETWORKS, DEFAULT_PROJECT_ID } from '../constants';

export const createWagmiAdapter = () => {
  return new WagmiAdapter({
    networks: DEFAULT_NETWORKS,
    projectId: DEFAULT_PROJECT_ID,
  });
};

interface AppKitInstanceProps {
  wagmiAdapter: WagmiAdapter;
  projectId?: string;
  metadata?: Metadata;
}

export function createAppKitInstance({
  wagmiAdapter,
  projectId,
  metadata,
}: AppKitInstanceProps) {
  return createAppKit({
    adapters: [wagmiAdapter],
    metadata,
    networks: DEFAULT_NETWORKS,
    projectId: projectId || DEFAULT_PROJECT_ID,
    features: {
      analytics: false,
    },
  });
}
