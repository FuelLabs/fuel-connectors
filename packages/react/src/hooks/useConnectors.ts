import { FuelConnector } from 'fuels';
import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

/**
 * `useConnectors` is a React Hook to fetch a list of connectors using the Fuel SDK.
 *
 * @see {@link https://github.com/FuelLabs/fuels-ts/blob/master/packages/account/src/connectors/fuel-connector.ts | fuel-connector.ts on `FuelLabs/fuel-ts`}
 *
 * This hook retrieves the available connectors from the Fuel SDK.
 *
 * @returns {object} An object containing:
 * - `connectors`: The list of available connectors.
 * - Additional properties from `useNamedQuery`.
 *
 * @example To fetch connectors:
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
