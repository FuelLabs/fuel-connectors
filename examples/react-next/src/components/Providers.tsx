'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { defaultConnectors } from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';

const queryClient = new QueryClient();

const fuelConfig = {
  connectors: defaultConnectors({
    devMode: true,
    wcProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
  }),
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <FuelProvider theme="dark" fuelConfig={fuelConfig}>
        {children}
      </FuelProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
