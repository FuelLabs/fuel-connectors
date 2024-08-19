import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

/**
 * `useNetwork` is a React Hook to retrieve the current network information.
 * The network information is fetched using the connected connector's `currentNetwork` method.
 *
 * @see {@link https://github.com/FuelLabs/fuels-ts/blob/master/packages/account/src/connectors/fuel-connector.ts | fuel-connector.ts on `FuelLabs/fuel-ts`}
 *
 * @returns {object} An object containing:
 * - `network`: The network information data.
 * - Additional properties from `useNamedQuery`.
 *
 * @example To get the current network information
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
