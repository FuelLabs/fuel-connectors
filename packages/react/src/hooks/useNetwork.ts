import type { Network } from 'fuels';
import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';
import { useIsConnected } from './useIsConnected';

type UseNetwork = {
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<'network', Network | null, Error, Network | null>;
};

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to retrieve the current network information in the connected app.
 *
 * @returns {object} An object containing:
 * - `network`: The network information data.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 *  To get the current network information
 * ```ts
 * const { network } = useNetwork();
 * console.log(network);
 * ```
 */
export const useNetwork = (params?: UseNetwork) => {
  const { fuel } = useFuel();
  const { isConnected } = useIsConnected();
  return useNamedQuery('network', {
    queryKey: QUERY_KEYS.currentNetwork(),
    queryFn: async () => {
      const current = await fuel.currentNetwork();
      if (!current && isConnected) {
        throw new Error('Network not found');
      }
      return current;
    },
    placeholderData: null,
    refetchOnMount: true,
    refetchInterval: (e) => {
      if (!e.state.data || e.state.error) {
        return 4000;
      }
      return false;
    },
    enabled: isConnected,
    ...params?.query,
  });
};
