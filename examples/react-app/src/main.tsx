import React from 'react';
import ReactDOM from 'react-dom/client';

import { FuelProvider } from '@fuel-wallet/react';
import { FuelWalletConnector } from '@fuels/connectors';

import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FuelProvider
      fuelConfig={{
        connectors: [new FuelWalletConnector()],
      }}
    >
      <App />
    </FuelProvider>
  </React.StrictMode>,
);
