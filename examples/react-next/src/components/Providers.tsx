'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { defaultConnectors } from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import { useState } from 'react';

const queryClient = new QueryClient();

const fuelConfig = {
  connectors: defaultConnectors({
    devMode: true,
    wcProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
  }),
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <QueryClientProvider client={queryClient}>
      <button
        type="submit"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        Switch theme {theme}
      </button>

      <FuelProvider theme={theme} fuelConfig={fuelConfig}>
        {children}
      </FuelProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
