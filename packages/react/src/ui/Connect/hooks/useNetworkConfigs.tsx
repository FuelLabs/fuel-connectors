import { useMemo } from 'react';
import { BASE_NETWORK_CONFIGS, DEFAULT_NETWORK } from '../../../config';
import type { NetworkConfig } from '../../../types';

export function useNetworkConfigs(networks?: Array<NetworkConfig>) {
  // Merge network configurations
  const _networks = useMemo<NetworkConfig[]>(() => {
    if (!networks) {
      return [DEFAULT_NETWORK];
    }

    return networks.map((network) => {
      if (!network.chainId) return network;
      const defaultConfig = BASE_NETWORK_CONFIGS.find(
        (n) => n.chainId === network.chainId,
      );
      return { ...defaultConfig, ...network };
    });
  }, [networks]);

  return {
    networks: _networks ?? [],
  };
}
