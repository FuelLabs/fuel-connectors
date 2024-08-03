import React from 'react';
import ReactDOM from 'react-dom/client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import Capsule, { Environment } from '@usecapsule/react-sdk';
import { capsuleConnector } from '@usecapsule/wagmi-v2-integration';

import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { http, createConfig, injected } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';

import { defaultConnectors } from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';

import * as Toast from '@radix-ui/react-toast';

import App from './App.tsx';
import ScreenSizeIndicator from './components/screensize-indicator.tsx';
import './index.css';

const queryClient = new QueryClient();

const capsule = new Capsule(
  Environment.BETA,
  '9e1ce73625425f6bd64fc79ab7ea7028',
  {},
);

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
    capsuleConnector({
      chains: [mainnet, sepolia],
      appName: METADATA.name,
      capsule,
      options: {},
    }),
  ],
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FuelProvider
        theme="dark"
        fuelConfig={{
          connectors: defaultConnectors({
            devMode: true,
            wcProjectId: WC_PROJECT_ID,
            ethWagmiConfig: wagmiConfig,
          }),
        }}
      >
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
