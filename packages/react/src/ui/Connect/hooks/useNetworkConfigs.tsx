import { useMemo } from 'react';
import { DEFAULT_NETWORKS } from '../../../config';
import type { NetworkConfig } from '../../../types';

export function useNetworkConfigs(networks?: Array<NetworkConfig>) {
  // Merge network configurations
  return useMemo(() => {
    if (!networks) return DEFAULT_NETWORKS;
    return networks.map((network) => {
      if (!network.chainId) return network;
      const defaultConfig = DEFAULT_NETWORKS.find(
        (n) => n.chainId === network.chainId,
      );
      return { ...defaultConfig, ...network };
    });
  }, [networks]);
}
