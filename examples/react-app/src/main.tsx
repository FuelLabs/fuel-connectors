import React from 'react';
import ReactDOM from 'react-dom/client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { FuelProvider } from '@fuel-wallet/react';
import { defaultConnectors } from '@fuels/connectors';

import * as Toast from '@radix-ui/react-toast';

import App from './App.tsx';
import ScreenSizeIndicator from './components/screensize-indicator.tsx';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FuelProvider
        theme="dark"
        fuelConfig={{
          devMode: true,
          connectors: defaultConnectors(),
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
