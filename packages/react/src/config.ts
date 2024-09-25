import { CHAIN_IDS } from 'fuels';
import type { NetworkConfig } from './types';

export const CONNECTOR_KEY = 'fuel-current-connector';
export const NATIVE_CONNECTORS = [
  'Fuel Wallet',
  'Fuel Wallet Development',
  'Fuelet Wallet',
  'Bako Safe',
];
export const DEFAULT_NETWORKS: Array<NetworkConfig> = [
  {
    chainId: CHAIN_IDS.fuel.testnet,
    bridgeURL:
      'https://app-testnet.fuel.network/bridge?from=eth&to=fuel&auto_close=true',
  },
  {
    chainId: CHAIN_IDS.fuel.devnet,
    bridgeURL:
      'https://app-devnet.fuel.network/bridge?from=eth&to=fuel&auto_close=true',
  },
  {
    chainId: CHAIN_IDS.fuel.mainnet,
    bridgeURL:
      'https://app.fuel.network/bridge?from=eth&to=fuel&auto_close=true',
  },
];
