import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to check the connection status with the connector.
 *
 * @returns {object} An object containing:
 * - `isConnected`: A boolean value indicating the connector is connected.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 *  To check if a connection is established:
 * ```ts
 * const { isConnected } = useIsConnected();
 * ```
 */
export const useIsConnected = () => {
  const { fuel } = useFuel();
  const query = useNamedQuery('isConnected', {
    queryKey: QUERY_KEYS.isConnected(),
    queryFn: async () => {
      try {
        const isConnected = await fuel.isConnected();
        return isConnected || false;
      } catch {
        return false;
      }
    },
    initialData: false,
    // This is required for now as Fuelet is not triggering the connection event
    refetchInterval: 1000,
  });

  return query;
};
