import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

/**
 * A hook to retrieve the current network information in the connected app.
 *
 * @returns {object} An object containing:
 * - `network`: The network information data.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | Properties of `@tanstack/react-query`, `useQuery` method}.
 * @todo Add a link to fuel connector's documentation.
 * @see {@link https://github.com/FuelLabs/fuels-connectors/blob/master/packages/docs/src/guide/react-hooks/hooks-reference.md | Hook Reference in Fuel Connectors Documentation}
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
