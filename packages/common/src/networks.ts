import { CHAIN_IDS, type Network } from 'fuels';

// Temporary constant for devnet chainId transition period
// TODO: Remove after 2-4 week transition period once all DApps are updated
const OLD_DEVNET_CHAIN_ID = 0;
const DEVNET_URL = 'https://devnet.fuel.network/v1/graphql';

export const TESTNET_NETWORK: Network = {
  chainId: CHAIN_IDS.fuel.testnet,
  url: 'https://testnet.fuel.network/v1/graphql',
};

export const MAINNET_NETWORK: Network = {
  chainId: CHAIN_IDS.fuel.mainnet,
  url: 'https://mainnet.fuel.network/v1/graphql',
};

export const DEFAULT_NETWORKS: Network[] = [
  TESTNET_NETWORK,
  {
    chainId: CHAIN_IDS.fuel.devnet,
    url: 'https://devnet.fuel.network/v1/graphql',
  },
  MAINNET_NETWORK,
];

export const getProviderUrl = (chainId: number): string => {
  // Support both old and new devnet chainId during transition period
  let lookupChainId = chainId;
  if (chainId === OLD_DEVNET_CHAIN_ID) {
    // Check if this is old devnet by trying to find devnet URL
    const devnetNetwork = DEFAULT_NETWORKS.find((n) => n.url === DEVNET_URL);
    if (devnetNetwork) {
      lookupChainId = devnetNetwork.chainId; // Use new chainId
      console.warn(
        `[fuel-connectors] Legacy devnet chainId (${OLD_DEVNET_CHAIN_ID}) detected. Please update to use chainId ${devnetNetwork.chainId}. Support for legacy chainId will be removed in a future release.`,
      );
    }
  }

  const network = DEFAULT_NETWORKS.find(
    (network) => network.chainId === lookupChainId,
  );

  if (!network || !network.url) {
    throw new Error(`Network with chainId ${chainId} not found`);
  }

  return network.url;
};
