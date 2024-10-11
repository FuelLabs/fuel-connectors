import React from 'react';
import ReactDOM from 'react-dom/client';

import { mainnet, sepolia } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { defaultConnectors } from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';

import * as Toast from '@radix-ui/react-toast';

import App from './App.tsx';
import ScreenSizeIndicator from './components/screensize-indicator.tsx';
import './index.css';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { CHAIN_IDS, Provider } from 'fuels';
import { CHAIN_ID_NAME, PROVIDER_URL } from './config.ts';

const queryClient = new QueryClient();
const isDev = process.env.NODE_ENV === 'development';

const WC_PROJECT_ID = import.meta.env.VITE_APP_WC_PROJECT_ID;
const METADATA = {
  name: 'Wallet Demo',
  description: 'Fuel Wallets Demo',
  url: location.href,
  icons: ['https://connectors.fuel.network/logo_white.png'],
};
const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, sepolia],
  projectId: WC_PROJECT_ID,
  syncConnectedChain: true,
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
    appKit: {
      metadata: METADATA,
      wagmiAdapter,
    },
    devMode: true,
    wcProjectId: WC_PROJECT_ID,
    ethWagmiConfig: wagmiAdapter.wagmiConfig,
    chainId: CHAIN_ID,
    fuelProvider: Provider.create(PROVIDER_URL),
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

      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>,
);
