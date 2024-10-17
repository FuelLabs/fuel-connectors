'use client';
import App from '@fuel-connectors/react-app/src/App';
import { ConfigProvider } from '@fuel-connectors/react-app/src/context/ConfigContext';
import { defaultConnectors } from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { http, createConfig, injected } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';
import { CHAIN_IDS, Provider, bn } from 'fuels';

const CHAIN_ID_NAME = process.env
  .NEXT_PUBLIC_CHAIN_ID_NAME as keyof typeof CHAIN_IDS.fuel;

const config = {
  explorerUrl: 'https://app-mainnet.fuel.network',
  providerUrl: 'https://some-provider-url',
  counterContractId: 'your-contract-id',
  chainIdName: 'mainnet',
  defaultAmount: bn.parseUnits(
    CHAIN_ID_NAME === 'mainnet' ? '0.000000001' : '0.0001',
  ),
};
const CHAIN_ID = CHAIN_IDS.fuel[CHAIN_ID_NAME];
const PROVIDER_URL = process.env.NEXT_PUBLIC_PROVIDER_URL;

const NETWORKS = [
  {
    chainId: CHAIN_ID,
    url: PROVIDER_URL,
  },
];
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';
const METADATA = {
  name: 'Wallet Demo',
  description: 'Fuel Wallets Demo',
  url: 'https://connectors.fuel.network',
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

if (!PROVIDER_URL) {
  throw new Error('PROVIDER_URL is not set');
}

const FUEL_CONFIG = {
  connectors: defaultConnectors({
    devMode: true,
    wcProjectId: WC_PROJECT_ID,
    ethWagmiConfig: wagmiConfig,
    chainId: CHAIN_ID,
    fuelProvider: Provider.create(PROVIDER_URL),
  }),
};

export default function Page() {
  return (
    <FuelProvider theme="dark" networks={NETWORKS} fuelConfig={FUEL_CONFIG}>
      <ConfigProvider config={config}>
        <App />
      </ConfigProvider>
    </FuelProvider>
  );
}
