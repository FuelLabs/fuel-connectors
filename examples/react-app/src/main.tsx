import React from 'react';
import ReactDOM from 'react-dom/client';

import { FuelWalletConnector } from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';

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
