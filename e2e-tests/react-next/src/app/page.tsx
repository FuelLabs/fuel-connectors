'use client';
import { defaultConnectors } from '@fuels/connectors';
import { FuelProvider } from '@fuels/react';
import { coinbaseWallet, walletConnect } from '@wagmi/connectors';
import { http, createConfig, injected } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';
import { CHAIN_IDS, Provider, bn } from 'fuels';
import App from 'react-app/src/App';
import {
  type Config,
  ConfigProvider,
} from 'react-app/src/context/ConfigContext';
import COUNTER_CONTRACT_ID_LOCAL from 'react-app/src/types/contract-ids-local.json';
import COUNTER_CONTRACT_ID_MAINNET from 'react-app/src/types/contract-ids-mainnet.json';
import COUNTER_CONTRACT_ID_TESTNET from 'react-app/src/types/contract-ids-testnet.json';

const CHAIN_ID_NAME = process.env
  .NEXT_PUBLIC_CHAIN_ID_NAME as keyof typeof CHAIN_IDS.fuel;
const CHAIN_ID = CHAIN_IDS.fuel[CHAIN_ID_NAME] || 0;
const PROVIDER_URL = process.env.NEXT_PUBLIC_PROVIDER_URL;

const CUSTOM_TRANSFER_AMOUNT = process.env.NEXT_PUBLIC_CUSTOM_TRANSFER_AMOUNT;
const FALLBACK_TRANSFER_AMOUNT =
  CHAIN_ID_NAME === 'mainnet' ? '0.000000001' : '0.0001';
const DEFAULT_AMOUNT = bn.parseUnits(
  CUSTOM_TRANSFER_AMOUNT ?? FALLBACK_TRANSFER_AMOUNT,
);

const CUSTOM_ASSET_ID = process.env.NEXT_PUBLIC_CUSTOM_ASSET_ID ?? undefined;
const CUSTOM_ASSET_SYMBOL =
  process.env.NEXT_PUBLIC_CUSTOM_ASSET_SYMBOL ?? 'ETH';

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

const FUEL_CONFIG = {
  connectors: defaultConnectors({
    devMode: true,
    wcProjectId: WC_PROJECT_ID,
    ethWagmiConfig: wagmiConfig,
    chainId: CHAIN_ID,
    fuelProvider: new Provider(PROVIDER_URL),
  }),
};

const config: Config = {
  explorerUrl:
    EXPLORER_URL_MAP[CHAIN_ID_NAME as keyof typeof EXPLORER_URL_MAP] ||
    EXPLORER_LOCAL_URL,
  providerUrl: PROVIDER_URL,
  counterContractId: getContractId(),
  chainIdName: CHAIN_ID_NAME,
  defaultAmount: DEFAULT_AMOUNT,
  assetId: CUSTOM_ASSET_ID,
  assetSymbol: CUSTOM_ASSET_SYMBOL,
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
