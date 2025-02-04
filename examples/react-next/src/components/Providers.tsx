'use client';
import { APP, DEFAULT_WAGMI_CONFIG, TRANSPORTS } from '@/config/config';
import { generateETHConnectors } from '@/utils/connectors';
import { createAppKit } from '@reown/appkit';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import {
  type AppKitNetwork,
  sepolia,
  solanaTestnet,
} from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type React from 'react';
import type { State } from 'wagmi';
import { ConnectProvider } from './ConnectProvider';
import { FuelProviders } from './FuelProviders';

const queryClient = new QueryClient();

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [sepolia, solanaTestnet];

const solanaWeb3JsAdapter = new SolanaAdapter();
const wagmiAdapter = new WagmiAdapter({
  networks,
  transports: TRANSPORTS,
  syncConnectedChain: true,
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID as string,
  connectors: generateETHConnectors(APP.name),
  storage: DEFAULT_WAGMI_CONFIG.storage,
  ssr: true,
});

const appkit = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  enableWalletConnect: !!process.env.NEXT_PUBLIC_WC_PROJECT_ID,
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID as string,
  networks: networks,
  allowUnsupportedChain: false,
  allWallets: 'ONLY_MOBILE',
  features: {
    email: false,
    socials: false,
    analytics: false,
  },
});

interface ProvidersProps {
  children: React.ReactNode;
  initialState?: State;
}

export function Providers({ children, initialState }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectProvider
        wagmiConfig={DEFAULT_WAGMI_CONFIG}
        wagmiInitialState={initialState}
      >
        <FuelProviders appkit={appkit}>{children}</FuelProviders>
      </ConnectProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
