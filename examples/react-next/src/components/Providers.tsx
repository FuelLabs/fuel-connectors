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

export type ProvidersProps = {
  children: React.ReactNode;
  wagmiInitialState?: State;
};

export const Providers = ({ children, wagmiInitialState }: ProvidersProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [config] = useState(() => getConfig());

  return (
    <WagmiProvider config={config} initialState={wagmiInitialState}>
      <QueryClientProvider client={queryClient}>
        <button
          type="submit"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          Switch theme {theme}
        </button>

        <FuelProvider
          theme="dark"
          uiConfig={{
            suggestBridge: true, // default true
          }}
          networks={[
            {
              chainId: CHAIN_IDS.fuel.testnet,
            },
          ]}
          fuelConfig={{
            connectors: defaultConnectors({
              devMode: true,
              wcProjectId: WC_PROJECT_ID,
              ethWagmiConfig: config,
              chainId: CHAIN_IDS.fuel.testnet,
            }),
          }}
        >
          {children}
        </FuelProvider>

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </WagmiProvider>
  );
};
