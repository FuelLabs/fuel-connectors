'use client';
import { APP, TRANSPORTS } from '@/config/config';
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
import { cookieStorage, cookieToInitialState, createStorage } from 'wagmi';
import { ConnectProvider } from './ConnectProvider';
import { FuelProviders } from './FuelProviders';

const queryClient = new QueryClient();

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [sepolia, solanaTestnet];

const solanaWeb3JsAdapter = new SolanaAdapter();
const wagmiAdapter = new WagmiAdapter({
  networks,
  transports: TRANSPORTS,
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID as string,
  connectors: generateETHConnectors(APP.name),
  storage: createStorage({
    storage: cookieStorage,
  }),
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

const wagmiConfig = wagmiAdapter.wagmiConfig;

interface ProvidersProps {
  children: React.ReactNode;
  cookie: string | null;
}

export function Providers({ children, cookie }: ProvidersProps) {
  const wagmiInitialState = cookieToInitialState(wagmiConfig, cookie);

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectProvider
        wagmiConfig={wagmiConfig}
        wagmiInitialState={wagmiInitialState}
      >
        <FuelProviders appkit={appkit}>{children}</FuelProviders>
      </ConnectProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
