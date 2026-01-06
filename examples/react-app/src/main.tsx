import React, { useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { counter as COUNTER_CONTRACT_ID_LOCAL } from './types/contract-ids-local.json';
import { counter as COUNTER_CONTRACT_ID_MAINNET } from './types/contract-ids-mainnet.json';
import { counter as COUNTER_CONTRACT_ID_TESTNET } from './types/contract-ids-testnet.json';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { http, createConfig, injected } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';

import { SocialConnector, defaultConnectors } from '@fuels/connectors';
import { FuelProvider, type NetworkConfig } from '@fuels/react';
import {
  PrivyProvider,
  usePrivy,
  useSignMessage,
  useWallets,
} from '@privy-io/react-auth';

import * as Toast from '@radix-ui/react-toast';

import App from './App.tsx';
import ScreenSizeIndicator from './components/screensize-indicator.tsx';
import './index.css';
import { type FuelConfig, Provider } from 'fuels';
import {
  CHAIN_ID,
  CHAIN_ID_NAME,
  COUNTER_CONTRACT_ID,
  CUSTOM_ASSET_ID,
  CUSTOM_ASSET_SYMBOL,
  DEFAULT_AMOUNT,
  EXPLORER_URL,
  PROVIDER_URL,
} from './config.ts';
import { type Config, ConfigProvider } from './context/ConfigContext.tsx';

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

// Privy App ID - replace with your own or use Bako's default
const PRIVY_APP_ID = 'cmdddunbk00njjf0nz6r5r3e9';

const config: Config = {
  explorerUrl: EXPLORER_URL,
  providerUrl: PROVIDER_URL,
  counterContractId: COUNTER_CONTRACT_ID,
  chainIdName: CHAIN_ID_NAME,
  defaultAmount: DEFAULT_AMOUNT,
  assetId: CUSTOM_ASSET_ID,
  assetSymbol: CUSTOM_ASSET_SYMBOL,
};

// Bridge component that injects Privy into connectors
function FuelProviderBridge({ children }: { children: React.ReactNode }) {
  const privy = usePrivy();
  const { wallets } = useWallets();
  const { signMessage } = useSignMessage();
  const connectorsRef = useRef<ReturnType<typeof defaultConnectors> | null>(
    null,
  );

  // Find the embedded wallet (Privy's internal wallet)
  const embeddedWallet = useMemo(() => {
    return wallets.find((wallet) => wallet.walletClientType === 'privy');
  }, [wallets]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: connectors should only be created once
  const fuelConfig: FuelConfig = useMemo(() => {
    const connectors = defaultConnectors({
      devMode: true,
      wcProjectId: WC_PROJECT_ID,
      ethWagmiConfig: wagmiConfig,
      chainId: CHAIN_ID,
      fuelProvider: new Provider(PROVIDER_URL),
      privyAuth: {
        ...privy,
        signMessage,
        embeddedWallet,
      },
    });
    connectorsRef.current = connectors;
    console.log(
      'Connectors:',
      connectors.map((c) => c.name),
    );
    return { connectors };
  }, []);

  // Update SocialConnector's privyAuth on every render to keep it in sync
  useEffect(() => {
    if (connectorsRef.current) {
      const socialConnector = connectorsRef.current.find(
        (c) => c instanceof SocialConnector,
      ) as SocialConnector | undefined;
      if (socialConnector) {
        socialConnector.setPrivyAuth({
          ...privy,
          signMessage,
          embeddedWallet,
        });
        console.log('Updated SocialConnector privyAuth', {
          ready: privy.ready,
          authenticated: privy.authenticated,
          hasEmbeddedWallet: !!embeddedWallet,
          embeddedWalletAddress: embeddedWallet?.address,
        });
      }
    }
  }); // No deps - update on every render to ensure privyAuth is always current

  return (
    <FuelProvider theme="dark" networks={NETWORKS} fuelConfig={fuelConfig}>
      {children}
    </FuelProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          appearance: {
            theme: 'dark',
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}
      >
        <FuelProviderBridge>
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
        </FuelProviderBridge>
      </PrivyProvider>
      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>,
);
