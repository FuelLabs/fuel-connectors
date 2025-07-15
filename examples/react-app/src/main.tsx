import React from 'react';
import ReactDOM from 'react-dom/client';
import { counter as COUNTER_CONTRACT_ID_LOCAL } from './types/contract-ids-local.json';
import { counter as COUNTER_CONTRACT_ID_MAINNET } from './types/contract-ids-mainnet.json';
import { counter as COUNTER_CONTRACT_ID_TESTNET } from './types/contract-ids-testnet.json';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { http, createConfig, injected } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';

import { defaultConnectors } from '@fuels/connectors';
import { FuelProvider, type NetworkConfig } from '@fuels/react';

import * as Toast from '@radix-ui/react-toast';

import App from './App.tsx';
import ScreenSizeIndicator from './components/screensize-indicator.tsx';
import './index.css';
import { type FuelConfig, Provider } from 'fuels';
import {
  CHAIN_ID,
  CHAIN_ID_NAME,
  COUNTER_CONTRACT_ID,
  DEFAULT_AMOUNT,
  EXPLORER_URL,
  PROVIDER_URL,
} from './config.ts';
import { ConfigProvider } from './context/ConfigContext.tsx';

if (!PROVIDER_URL) {
  throw new Error('VITE_FUEL_PROVIDER_URL is not set');
}

const queryClient = new QueryClient();
const isDev = process.env.NODE_ENV === 'development';

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

const NETWORKS: NetworkConfig[] = [
  {
    chainId: CHAIN_ID,
    url: PROVIDER_URL,
  },
];

const FUEL_CONFIG: FuelConfig = {
  connectors: defaultConnectors({
    devMode: true,
    wcProjectId: WC_PROJECT_ID,
    ethWagmiConfig: wagmiConfig,
    chainId: CHAIN_ID,
    fuelProvider: new Provider(PROVIDER_URL),
  }),
};

const config = {
  explorerUrl: EXPLORER_URL,
  providerUrl: PROVIDER_URL,
  counterContractId: COUNTER_CONTRACT_ID,
  chainIdName: CHAIN_ID_NAME,
  defaultAmount: DEFAULT_AMOUNT,
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FuelProvider theme="dark" networks={NETWORKS} fuelConfig={FUEL_CONFIG}>
        <ConfigProvider config={config}>
          <Toast.Provider>
            <App />
            <Toast.Viewport
              id="toast-viewport"
              className="fixed bottom-0 right-0 z-[100] m-0 flex w-[420px] max-w-[100vw] list-none flex-col gap-[10px] p-[var(--viewport-padding)] outline-none [--viewport-padding:_25px]"
            />
          </Toast.Provider>
        </ConfigProvider>
        <ScreenSizeIndicator />
      </FuelProvider>

      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>,
);
