'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { DEFAULT_WAGMI_CONFIG } from '@/config/config';
import { createConfig, defaultConnectors } from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import { CHAIN_IDS, Provider } from 'fuels';
import { useState } from 'react';
import { type State, WagmiProvider } from 'wagmi';

const queryClient = new QueryClient();

const NETWORKS = [
  {
    chainId: CHAIN_IDS.fuel.testnet,
    url: 'https://testnet.fuel.network/v1/graphql',
  },
];

// For SSR application we need to use
// createConfig to avoid errors related to window
// usage inside the connectors.
const FUEL_CONFIG = createConfig(() => {
  return {
    connectors: defaultConnectors({
      devMode: true,
      wcProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
      ethWagmiConfig: DEFAULT_WAGMI_CONFIG,
      chainId: NETWORKS[0].chainId,
      fuelProvider: Provider.create(NETWORKS[0].url),
    }),
  };
});

export const Providers = ({
  children,
  initialState,
}: { children: React.ReactNode; initialState?: State }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <WagmiProvider config={DEFAULT_WAGMI_CONFIG} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <button
          type="submit"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          Switch theme {theme}
        </button>
        <FuelProvider
          theme={theme}
          fuelConfig={FUEL_CONFIG}
          networks={NETWORKS}
        >
          {children}
        </FuelProvider>

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </WagmiProvider>
  );
};
