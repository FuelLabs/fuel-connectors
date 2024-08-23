import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

/**
 * A hook to retrieve the current provider in the connected app.
 *
 * @returns {object} An object containing:
 * - `provider`: The provider data or `null`.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | Properties of `@tanstack/react-query`, `useQuery` method}.
 * @todo Add a link to fuel connector's documentation.
 * @see {@link https://github.com/FuelLabs/fuels-connectors/blob/master/packages/docs/src/guide/react-hooks/hooks-reference.md | Hook Reference in Fuel Connectors Documentation}
 *
 * @example To get the current provider
 * ```ts
 * const { provider } = useProvider();
 * ```
 */
export const useProvider = () => {
  const { fuel } = useFuel();

  return useNamedQuery('provider', {
    queryKey: QUERY_KEYS.provider(),
    queryFn: async () => {
      const provider = await fuel.getProvider();
      return provider || null;
    },
    initialData: null,
  });
};
