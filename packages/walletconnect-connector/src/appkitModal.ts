import { type AppKit, createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, sepolia } from '@reown/appkit/networks';
import { http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { DEFAULT_PROJECT_ID } from './constants';

interface CreateAppkitProps {
  wagmiAdapter: WagmiAdapter;
  projectId?: string;
}

interface CreateWagmiAdapterProps {
  projectId: string | undefined;
}

export const createDefaultWagmiAdapter = ({
  projectId = DEFAULT_PROJECT_ID,
}: CreateWagmiAdapterProps): WagmiAdapter => {
  const adapter = new WagmiAdapter({
    networks: [sepolia, mainnet],
    projectId,
    syncConnectedChain: true,
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
    connectors: [injected({ shimDisconnect: false })],
  });

  return adapter;
};

export function createAppkitInstance({
  wagmiAdapter,
  projectId = DEFAULT_PROJECT_ID,
}: CreateAppkitProps): AppKit {
  if (!projectId) {
    console.warn(
      '[WalletConnect Connector]: Get a project ID on https://cloud.reown.com/sign-in to use @reown/appkit features.',
    );
  }

  return createAppKit({
    adapters: [wagmiAdapter],
    enableWalletConnect: !!projectId,
    projectId,
    networks: [sepolia, mainnet], // @TODO: Should we receive it from the application? as the wagmi adapter config
    allowUnsupportedChain: true,
    allWallets: 'ONLY_MOBILE',
    features: {
      email: false,
      socials: false,
      analytics: false,
    },
  });
}
