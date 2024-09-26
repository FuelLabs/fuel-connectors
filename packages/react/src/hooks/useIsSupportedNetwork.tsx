import { useMemo } from 'react';
import { useFuel } from '../providers';
import { useCurrentConnector } from './useCurrentConnector';
import { useIsConnected } from './useIsConnected';
import { useProvider } from './useProvider';

/*
 * @TODO Fuel provider.getChainId() uses a cached value, because of that, is expected that if user was in a different connector
 * with a different network, and than diconnects and try to reconnec the screen blinks for a short time.
 */
export function useIsSupportedNetwork() {
  const { networks } = useFuel();
  const { provider } = useProvider();
  const { isConnected } = useIsConnected();
  const { currentConnector } = useCurrentConnector();
  const isSupportedNetwork = useMemo(() => {
    if (!currentConnector) return true;
    if (!isConnected) return true;
    if (!provider) return true;
    const chainId = provider.getChainId();
    return !!networks.find((n) => n.chainId === chainId);
  }, [provider, networks, isConnected, currentConnector]);
  return { isSupportedNetwork };
}
