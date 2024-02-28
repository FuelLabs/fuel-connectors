import React from 'react';
import ReactDOM from 'react-dom/client';

import { FuelProvider } from '@fuel-wallet/react';
import { FuelWalletConnector } from '@fuels/connectors';

import App from './App.tsx';

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FuelProvider fuelConfig={{ connectors: [new FuelWalletConnector()] }}>
      <App />
    </FuelProvider>
  </React.StrictMode>,
);
