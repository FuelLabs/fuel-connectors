'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { http, createConfig, injected } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';

import { defaultConnectors } from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';

const queryClient = new QueryClient();

// ============================================================
// WalletConnect Connector configurations
// https://docs.walletconnect.com/web3modal/javascript/about
// ============================================================
const WC_PROJECT_ID =
  process.env.WC_PROJECT_ID ?? '00000000000000000000000000000000';
const METADATA = {
  name: 'Wallet Demo',
  description: 'Fuel Wallets Demo',
  url: location.href,
  icons: ['https://connectors.fuel.network/logo_white.png'],
};
const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [
    injected({ shimDisconnect: false }),
    walletConnect({
      projectId: WC_PROJECT_ID,
      metadata: METADATA,
      showQrModal: false,
    }),
    coinbaseWallet({
      appName: METADATA.name,
      appLogoUrl: METADATA.icons[0],
      darkMode: true,
      reloadOnDisconnect: true,
    }),
  ],
});

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <FuelProvider
        theme="dark"
        fuelConfig={{
          connectors: defaultConnectors({
            devMode: true,
            wagmiConfig,
            wcProjectId: WC_PROJECT_ID,
          }),
        }}
      >
        {children}
      </FuelProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
