import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

/**
 * `useIsConnected` is a React Hook to check the connection status with the connector.
 * The connection status is fetched using the connected connector's `isConnected` method.
 *
 * @see {@link https://github.com/FuelLabs/fuels-ts/blob/master/packages/account/src/connectors/fuel-connector.ts | fuel-connector.ts on `FuelLabs/fuel-ts`}
 *
 * @returns {object} An object containing:
 * - `data`: A boolean value indicating the connector is connected.
 * - Additional properties from `useNamedQuery`.
 *
 * @example To check if a connection is established:
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
  });

  return query;
};
