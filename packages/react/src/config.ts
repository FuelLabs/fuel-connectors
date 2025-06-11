import { CHAIN_IDS } from 'fuels';
import type { NetworkConfig } from './types';

export const CONNECTOR_KEY = 'fuel-current-connector';

export const NATIVE_CONNECTORS = [
  'Arcana Wallet',
  'Bako Safe',
  'Burner Wallet',
  'Fuel Wallet',
  'Fuel Wallet Development',
  'Fuelet Wallet',
];

export const DEFAULT_NETWORK: NetworkConfig = {
  chainId: CHAIN_IDS.fuel.mainnet,
  url: 'https://mainnet.fuel.network/v1/graphql',
  bridgeURL: 'https://app.fuel.network/bridge?from=eth&to=fuel&auto_close=true',
};

export const BASE_NETWORK_CONFIGS: NetworkConfig[] = [
  {
    chainId: CHAIN_IDS.fuel.testnet,
    url: 'https://testnet.fuel.network/v1/graphql',
    bridgeURL:
      'https://app-testnet.fuel.network/bridge?from=eth&to=fuel&auto_close=true',
  },
  {
    chainId: CHAIN_IDS.fuel.devnet,
    url: 'https://devnet.fuel.network/v1/graphql',
    bridgeURL:
      'https://app-devnet.fuel.network/bridge?from=eth&to=fuel&auto_close=true',
  },
  DEFAULT_NETWORK,
];
