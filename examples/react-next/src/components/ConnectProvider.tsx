'use client';

import { ConnectKitProvider } from 'connectkit';
import type { ReactNode } from 'react';
import type { State } from 'wagmi';

import { DEFAULT_WAGMI_CONFIG } from '@/config/config';
import { WagmiProvider } from 'wagmi';

type ProvidersProps = {
  children: ReactNode;
  wagmiInitialState: State | undefined;
};

export function ConnectProvider({
  children,
  wagmiInitialState,
}: ProvidersProps) {
  return (
    <WagmiProvider
      config={DEFAULT_WAGMI_CONFIG}
      initialState={wagmiInitialState}
    >
      <ConnectKitProvider>{children}</ConnectKitProvider>
    </WagmiProvider>
  );
}
