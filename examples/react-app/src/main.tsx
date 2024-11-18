import React from 'react';
import ReactDOM from 'react-dom/client';
import { counter as COUNTER_CONTRACT_ID_LOCAL } from './types/contract-ids-local.json';
import { counter as COUNTER_CONTRACT_ID_MAINNET } from './types/contract-ids-mainnet.json';
import { counter as COUNTER_CONTRACT_ID_TESTNET } from './types/contract-ids-testnet.json';

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
import { CHAIN_IDS, Provider, bn } from 'fuels';
import { CHAIN_ID_NAME, PROVIDER_URL } from './config.ts';
import { ConfigProvider } from './context/ConfigContext.tsx';

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

const CHAIN_ID = CHAIN_IDS.fuel[CHAIN_ID_NAME] || 0;

if (!PROVIDER_URL) {
  throw new Error('VITE_FUEL_PROVIDER_URL is not set');
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
function getContractId() {
  switch (CHAIN_ID_NAME) {
    case 'mainnet':
      return COUNTER_CONTRACT_ID_MAINNET;
    case 'testnet':
      return COUNTER_CONTRACT_ID_TESTNET;
    default:
      return COUNTER_CONTRACT_ID_LOCAL;
  }
}

export const EXPLORER_LOCAL_URL = 'http://localhost:3001';
export const EXPLORER_URL_MAP: Record<keyof typeof CHAIN_IDS.fuel, string> = {
  testnet: 'https://app-testnet.fuel.network',
  devnet: 'https://app-testnet.fuel.network',
  mainnet: 'https://app-mainnet.fuel.network',
};

const config = {
  explorerUrl:
    EXPLORER_URL_MAP[CHAIN_ID_NAME as keyof typeof EXPLORER_URL_MAP] ||
    EXPLORER_LOCAL_URL,
  providerUrl: import.meta.env.VITE_FUEL_PROVIDER_URL,
  counterContractId: getContractId(),
  chainIdName: import.meta.env
    .VITE_CHAIN_ID_NAME as keyof typeof CHAIN_IDS.fuel,
  defaultAmount: bn.parseUnits(
    CHAIN_ID_NAME === 'mainnet' ? '0.000000001' : '0.0001',
  ),
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
