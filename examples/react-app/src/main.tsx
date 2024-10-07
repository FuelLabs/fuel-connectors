import React from 'react';
import ReactDOM from 'react-dom/client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { http, createConfig, injected } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';

import { defaultConnectors } from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';

import * as Toast from '@radix-ui/react-toast';

import App from './App.tsx';
import ScreenSizeIndicator from './components/screensize-indicator.tsx';
import './index.css';
import { CHAIN_IDS, Provider } from 'fuels';

const queryClient = new QueryClient();

// ============================================================
// WalletConnect Connector configurations
// https://docs.walletconnect.com/web3modal/javascript/about
// ============================================================
const WC_PROJECT_ID = import.meta.env.VITE_APP_WC_PROJECT_ID;
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

const CHAIN_ID =
  CHAIN_IDS.fuel[
    import.meta.env.VITE_CHAIN_ID_NAME as keyof typeof CHAIN_IDS.fuel
  ];

if (!CHAIN_ID) {
  throw new Error('VITE_CHAIN_ID_NAME is not set');
}

if (!import.meta.env.VITE_PROVIDER_URL) {
  throw new Error('VITE_PROVIDER_URL is not set');
}

const NETWORKS = [
  {
    chainId: CHAIN_ID,
    url: import.meta.env.VITE_PROVIDER_URL,
  },
];

const FUEL_CONFIG = {
  connectors: defaultConnectors({
    devMode: true,
    wcProjectId: WC_PROJECT_ID,
    ethWagmiConfig: wagmiConfig,
    chainId: CHAIN_ID,
    fuelProvider: Provider.create(import.meta.env.VITE_PROVIDER_URL),
  }),
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FuelProvider theme="dark" networks={NETWORKS} fuelConfig={FUEL_CONFIG}>
        <Toast.Provider>
          <App />
          <Toast.Viewport
            id="toast-viewport"
            className="fixed bottom-0 right-0 z-[100] m-0 flex w-[420px] max-w-[100vw] list-none flex-col gap-[10px] p-[var(--viewport-padding)] outline-none [--viewport-padding:_25px]"
          />
        </Toast.Provider>
        <ScreenSizeIndicator />
      </FuelProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
