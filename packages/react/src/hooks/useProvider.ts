import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to retrieve the current provider in the connected app.
 *
 * @returns {object} An object containing:
 * - `provider`: The provider data or `null`.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 * To get the current provider:
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
