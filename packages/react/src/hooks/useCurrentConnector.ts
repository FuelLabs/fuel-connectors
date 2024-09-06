import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to fetch the connected connector.
 *
 * @returns {object} An object containing:
 * - `connector`: The connected connector.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 * To fetch the connector:
 * ```ts
 * const { connector } = useCurrentConnector();
 * console.log(connector);
 * ```
 */
export const useCurrentConnector = () => {
  const { fuel } = useFuel();

  return useNamedQuery('connector', {
    queryKey: QUERY_KEYS.currentConnector(),
    queryFn: () => {
      return fuel.currentConnector() ?? null;
    },
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    initialData: null,
  });
};
