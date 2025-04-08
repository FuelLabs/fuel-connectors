import {
  FuelProvider as FuelProviderBase,
  type NetworkConfig,
} from '@fuels/react';
import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { http, createConfig, injected } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';
import { CHAIN_IDS, type FuelConfig, Provider } from 'fuels';
import { useState } from 'react';

import { defaultConnectors } from '@fuels/connectors';

import { CHAIN_ID_NAME } from '../config';

interface FuelProviderProps {
  children: React.ReactNode;
}

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

const CHAIN_ID = CHAIN_IDS.fuel[CHAIN_ID_NAME] || 0;
const PROVIDER_URL = import.meta.env.VITE_FUEL_PROVIDER_URL;

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

if (!PROVIDER_URL) {
  throw new Error('VITE_FUEL_PROVIDER_URL is not set');
}

export function FuelProvider({ children }: FuelProviderProps) {
  const [isDark, setIsDark] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsDark(!isDark)}
        className="fixed top-4 right-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Toggle Theme ({isDark ? 'Dark' : 'Light'})
      </button>
      <FuelProviderBase
        theme={isDark ? 'dark' : 'light'}
        networks={NETWORKS}
        fuelConfig={FUEL_CONFIG}
      >
        {children}
      </FuelProviderBase>
    </div>
  );
}
