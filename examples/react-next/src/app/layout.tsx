'use client';

import '../index.css';
import { defaultConnectors } from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import * as Toast from '@radix-ui/react-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { http, createConfig, injected } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';
import { CHAIN_IDS, Provider } from 'fuels';
import type React from 'react';
import ScreenSizeIndicator from '../components/screensize-indicator';
import { CHAIN_ID_NAME, PROVIDER_URL } from '../config/config';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  const isDev = process.env.NODE_ENV === 'development';

  // ============================================================
  // WalletConnect Connector configurations
  // https://docs.walletconnect.com/web3modal/javascript/about
  // ============================================================
  const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';
  const METADATA = {
    name: 'Wallet Demo',
    description: 'Fuel Wallets Demo',
    url: 'https://connectors.fuel.network',
    icons: ['https://connectors.fuel.network/logo_white.png'],
  };
  const wagmiConfig = createConfig({
    chains: [mainnet, sepolia],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
    syncConnectedChain: true,
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

  const CHAIN_ID = CHAIN_IDS.fuel[CHAIN_ID_NAME];

  if (CHAIN_ID == null) {
    throw new Error('VITE_CHAIN_ID_NAME is not set');
  }

  if (!PROVIDER_URL) {
    throw new Error('VITE_PROVIDER_URL is not set');
  }

  const NETWORKS = [
    {
      chainId: CHAIN_ID,
      url: PROVIDER_URL,
    },
  ];

  const FUEL_CONFIG = {
    connectors: defaultConnectors({
      devMode: true,
      wcProjectId: WC_PROJECT_ID,
      ethWagmiConfig: wagmiConfig,
      chainId: CHAIN_ID,
      fuelProvider: Provider.create(PROVIDER_URL),
    }),
  };
  return (
    <html lang="en">
      <head>
        <link
          rel="shortcut icon"
          type="image/png"
          href="https://connectors.fuel.network/logo.png"
        />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Fuel enables developers to build integrations with any wallet."
        />
        <title>Fuel Connectors</title>

        <meta property="og:url" content="https://connectors.fuel.network/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Fuel Connectors" />
        <meta
          property="og:description"
          content="Fuel enables developers to build integrations with any wallet."
        />
        <meta
          property="og:image"
          content="https://connectors.fuel.network/og-image.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="connectors.fuel.network" />
        <meta
          property="twitter:url"
          content="https://connectors.fuel.network/"
        />
        <meta name="twitter:title" content="Fuel Connectors" />
        <meta
          name="twitter:description"
          content="Fuel enables developers to build integrations with any wallet."
        />
        <meta
          name="twitter:image"
          content="https://connectors.fuel.network/og-image.png"
        />
      </head>

      <body>
        <div id="root">
          <QueryClientProvider client={queryClient}>
            <FuelProvider
              theme="dark"
              networks={NETWORKS}
              fuelConfig={FUEL_CONFIG}
            >
              <Toast.Provider>
                {children}
                <Toast.Root />
              </Toast.Provider>
              <ScreenSizeIndicator />
            </FuelProvider>
            {isDev && <ReactQueryDevtools initialIsOpen={false} />}
          </QueryClientProvider>
        </div>
      </body>
    </html>
  );
}
