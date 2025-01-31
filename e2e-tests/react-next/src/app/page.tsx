'use client';
import { defaultConnectors } from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import { createAppKit } from '@reown/appkit';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { type AppKitNetwork, solanaTestnet } from '@reown/appkit/networks';
import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { http, createConfig, injected } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';
import { CHAIN_IDS, Provider, bn } from 'fuels';
import App from 'react-app/src/App';
import { ConfigProvider } from 'react-app/src/context/ConfigContext';
import COUNTER_CONTRACT_ID_LOCAL from 'react-app/src/types/contract-ids-local.json';
import COUNTER_CONTRACT_ID_MAINNET from 'react-app/src/types/contract-ids-mainnet.json';
import COUNTER_CONTRACT_ID_TESTNET from 'react-app/src/types/contract-ids-testnet.json';

const CHAIN_ID_NAME = process.env
  .NEXT_PUBLIC_CHAIN_ID_NAME as keyof typeof CHAIN_IDS.fuel;
const CHAIN_ID = CHAIN_IDS.fuel[CHAIN_ID_NAME] || 0;
const PROVIDER_URL = process.env.NEXT_PUBLIC_PROVIDER_URL;

if (!PROVIDER_URL) {
  throw new Error(`PROVIDER_URL is not set: ${PROVIDER_URL}`);
}

function getContractId() {
  switch (CHAIN_ID_NAME) {
    case 'mainnet':
      return COUNTER_CONTRACT_ID_MAINNET.counter;
    case 'testnet':
      return COUNTER_CONTRACT_ID_TESTNET.counter;
    default:
      return COUNTER_CONTRACT_ID_LOCAL.counter;
  }
}

const EXPLORER_LOCAL_URL = 'http://localhost:3001';
const EXPLORER_URL_MAP: Record<keyof typeof CHAIN_IDS.fuel, string> = {
  testnet: 'https://app-testnet.fuel.network',
  devnet: 'https://app-testnet.fuel.network',
  mainnet: 'https://app-mainnet.fuel.network',
};

const METADATA = {
  name: 'Wallet Demo',
  description: 'Fuel Wallets Demo',
  url: 'https://connectors.fuel.network',
  icons: ['https://connectors.fuel.network/logo_white.png'],
};

const NETWORKS = [
  {
    chainId: CHAIN_ID,
    url: PROVIDER_URL,
  },
];

const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [sepolia, solanaTestnet];

const solanaWeb3JsAdapter = new SolanaAdapter();
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId: WC_PROJECT_ID,
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

const appkit = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  enableWalletConnect: !!WC_PROJECT_ID,
  projectId: WC_PROJECT_ID,
  networks: networks,
  allowUnsupportedChain: false,
  allWallets: 'ONLY_MOBILE',
  features: {
    email: false,
    socials: false,
    analytics: false,
  },
});

const FUEL_CONFIG = {
  connectors: defaultConnectors({
    devMode: true,
    wcProjectId: WC_PROJECT_ID,
    appkit,
    chainId: CHAIN_ID,
    fuelProvider: Provider.create(PROVIDER_URL),
  }),
};

const config = {
  explorerUrl:
    EXPLORER_URL_MAP[CHAIN_ID_NAME as keyof typeof EXPLORER_URL_MAP] ||
    EXPLORER_LOCAL_URL,
  providerUrl: PROVIDER_URL,
  counterContractId: getContractId(),
  chainIdName: CHAIN_ID_NAME,
  defaultAmount: bn.parseUnits(
    CHAIN_ID_NAME === 'mainnet' ? '0.000000001' : '0.0001',
  ),
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
