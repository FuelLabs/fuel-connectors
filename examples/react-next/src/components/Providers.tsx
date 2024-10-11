'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import type { State } from 'wagmi';
import { ConnectProvider } from './ConnectProvider';
import { FuelProviders } from './FuelProviders';

const queryClient = new QueryClient();

export function Providers({
  children,
  initialState: wagmiInitialState,
}: { children: React.ReactNode; initialState?: State }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectProvider wagmiInitialState={wagmiInitialState}>
        <FuelProviders>{children}</FuelProviders>
      </ConnectProvider>
    </QueryClientProvider>
  );
}
