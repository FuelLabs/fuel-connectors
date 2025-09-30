import { CHAIN_IDS, type Network } from 'fuels';

// ============================================================
// Network configurations
// ============================================================

/**
 * Testnet network configuration for Fuel.
 */
export const TESTNET_NETWORK: Network = {
  chainId: CHAIN_IDS.fuel.testnet,
  url: 'https://testnet.fuel.network/v1/graphql',
};

/**
 * Mainnet network configuration for Fuel.
 */
export const MAINNET_NETWORK: Network = {
  chainId: CHAIN_IDS.fuel.mainnet,
  url: 'https://mainnet.fuel.network/v1/graphql',
};

/**
 * Devnet network configuration for Fuel.
 */
export const DEVNET_NETWORK: Network = {
  chainId: CHAIN_IDS.fuel.devnet,
  url: 'https://devnet.fuel.network/v1/graphql',
};

/**
 * Array of all available networks, ordered by preference.
 */
export const AVAILABLE_NETWORKS: Network[] = [
  TESTNET_NETWORK,
  DEVNET_NETWORK,
  MAINNET_NETWORK,
];

// ============================================================
// Network utility functions
// ============================================================

/**
 * Gets the provider URL for a given chain ID.
 *
 * @param chainId - The chain ID to look up
 * @returns The provider URL for the network
 * @throws Error if network is not found
 *
 * @example
 * ```typescript
 * const providerUrl = getProviderUrl(CHAIN_IDS.fuel.testnet);
 * // Returns: 'https://testnet.fuel.network/v1/graphql'
 * ```
 */
export const getProviderUrl = (chainId: number): string => {
  const network = AVAILABLE_NETWORKS.find(
    (network) => network.chainId === chainId,
  );

  if (!network || !network.url) {
    throw new Error(`Network with chainId ${chainId} not found`);
  }

  return network.url;
};
