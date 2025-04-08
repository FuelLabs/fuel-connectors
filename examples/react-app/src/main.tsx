import React from 'react';
import ReactDOM from 'react-dom/client';
import { counter as COUNTER_CONTRACT_ID_LOCAL } from './types/contract-ids-local.json';
import { counter as COUNTER_CONTRACT_ID_MAINNET } from './types/contract-ids-mainnet.json';
import { counter as COUNTER_CONTRACT_ID_TESTNET } from './types/contract-ids-testnet.json';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import * as Toast from '@radix-ui/react-toast';

import { type CHAIN_IDS, bn } from 'fuels';
import App from './App.tsx';
import ScreenSizeIndicator from './components/screensize-indicator.tsx';
import { ConfigProvider } from './context/ConfigContext.tsx';
import { FuelProvider } from './providers/FuelProvider.tsx';

import './index.css';

const queryClient = new QueryClient();
const isDev = process.env.NODE_ENV === 'development';

const CHAIN_ID_NAME = import.meta.env
  .VITE_CHAIN_ID_NAME as keyof typeof CHAIN_IDS.fuel;

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
      <FuelProvider>
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
