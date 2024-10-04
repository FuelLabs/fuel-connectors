import { Provider } from 'fuels';
import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';
import { useCurrentConnector } from './useCurrentConnector';
import { useIsConnected } from './useIsConnected';
import { useNetwork } from './useNetwork';

type UseIsSupportedNetwork = {
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<'isSupportedNetwork', boolean, Error, boolean>;
};

/**
 * A hook to check if the current network, matches with provided networks config on FuelProvider.
 *
 * @returns {object} An object containing:
 * - `isSupportedNetwork`: The value if the current network is supported.
 *
 * @examples
 * To check if network is supported:
 * ```ts
 * const { isSupportedNetwork } = useIsSupportedNetwork();
 * console.log(isSupportedNetwork);
 * ```
 */
export function useIsSupportedNetwork(params?: UseIsSupportedNetwork) {
  const { networks } = useFuel();
  const { network } = useNetwork();
  const { isConnected } = useIsConnected();
  const { currentConnector } = useCurrentConnector();
  return useNamedQuery('isSupportedNetwork', {
    queryKey: QUERY_KEYS.isSupportedNetwork(
      currentConnector?.name,
      network,
      isConnected,
    ),
    queryFn: async () => {
      if (!currentConnector) return true;
      if (!isConnected) return true;
      if (!network) return true;
      let chainId = network.chainId;
      if (chainId == null) {
        chainId = (await Provider.create(network.url)).getChainId();
      }
      return !!networks.find((n) => n.chainId === chainId);
    },
    placeholderData: true,
    ...params,
  });
}
