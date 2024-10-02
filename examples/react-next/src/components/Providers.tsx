'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { getConfig } from '@/app/config';
import { defaultConnectors } from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import { CHAIN_IDS } from 'fuels';
import { useState } from 'react';
import { type State, WagmiProvider } from 'wagmi';

const queryClient = new QueryClient();
const WC_PROJECT_ID =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? '00000000000000000000000000000000';
const NETWORKS = [
  {
    chainId: CHAIN_IDS.fuel.testnet,
    url: 'https://testnet.fuel.network/v1/graphql',
  },
];

export type ProvidersProps = {
  children: React.ReactNode;
  wagmiInitialState?: State;
};

export const Providers = ({ children, wagmiInitialState }: ProvidersProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [wagmiConfig] = useState(() => getConfig());
  const fuelConfig = {
    connectors: defaultConnectors({
      devMode: true,
      wcProjectId: WC_PROJECT_ID,
      ethWagmiConfig: wagmiConfig,
      chainId: CHAIN_IDS.fuel.testnet,
    }),
  };

  return (
    <WagmiProvider config={wagmiConfig} initialState={wagmiInitialState}>
      <QueryClientProvider client={queryClient}>
        <button
          type="submit"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          Switch theme {theme}
        </button>

        <FuelProvider theme="dark" networks={NETWORKS} fuelConfig={fuelConfig}>
          {children}
        </FuelProvider>

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </WagmiProvider>
  );
};
