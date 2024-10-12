import type { Network } from 'fuels';
import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

type UseNetworkParams = {
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<
    'networks',
    Array<Network>,
    Error,
    Array<Network>
  >;
};

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to retrieve all networks available in the connected app.
 *
 * @returns {object} An object containing:
 * - `networks`:  List of all networks available for the current connection.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 *  To get the list of networks
 * ```ts
 * const { networks } = useNetworks();
 * console.log(networks);
 * ```
 */
export const useNetworks = (params?: UseNetworkParams) => {
  const { fuel } = useFuel();

  return useNamedQuery('networks', {
    queryKey: QUERY_KEYS.networks(),
    queryFn: fuel.networks,
    placeholderData: [],
    ...params?.query,
  });
};
