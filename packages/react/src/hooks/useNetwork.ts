import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

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
export const useNetwork = () => {
  const { fuel } = useFuel();

  return useNamedQuery('network', {
    queryKey: QUERY_KEYS.currentNetwork(),
    queryFn: async () => {
      return fuel.currentNetwork();
    },
    initialData: null,
  });
};
