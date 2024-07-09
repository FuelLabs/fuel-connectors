'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import {
  BakoSafeConnector,
  FuelWalletConnector,
  FuelWalletDevelopmentConnector,
  FueletWalletConnector,
  SolanaConnector,
  WalletConnectConnector,
} from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';

const queryClient = new QueryClient();

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <FuelProvider
        theme="dark"
        fuelConfig={{
          connectors: [
            new FuelWalletConnector(),
            new FuelWalletDevelopmentConnector(),
            new BakoSafeConnector(),
            new FueletWalletConnector(),
            new WalletConnectConnector(),
            new SolanaConnector(),
          ],
        }}
      >
        {children}
      </FuelProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
