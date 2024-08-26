import { FuelConnector } from 'fuels';
import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to fetch a list of connectors in the connected app.
 *
 * @returns {object} An object containing:
 * - `connectors`: The list of available connectors.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | Properties of `@tanstack/react-query`, `useQuery` method}.
 *
 * @examples
 * To fetch connectors:
 * ```ts
 * const { connectors } = useConnectors();
 * console.log(connectors);
 * ```
 */
export const useConnectors = () => {
  const { fuel } = useFuel();

  return useNamedQuery('connectors', {
    queryKey: QUERY_KEYS.connectorList(),
    queryFn: async () => {
      return fuel.connectors();
    },
    initialData: [],
  });
};
