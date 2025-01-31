'use client';

import { ConnectKitProvider } from 'connectkit';
import type { ReactNode } from 'react';
import type { Config, State } from 'wagmi';

import { WagmiProvider } from 'wagmi';

type ProvidersProps = {
  children: ReactNode;
  wagmiConfig: Config;
  wagmiInitialState: State | undefined;
};

export function ConnectProvider({
  children,
  wagmiConfig,
  wagmiInitialState,
}: ProvidersProps) {
  return (
    <WagmiProvider config={wagmiConfig} initialState={wagmiInitialState}>
      <ConnectKitProvider>{children}</ConnectKitProvider>
    </WagmiProvider>
  );
}
