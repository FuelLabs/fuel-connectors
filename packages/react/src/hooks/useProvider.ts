import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

/**
 * `useProvider` is a React Hook to retrieve the current provider using the Fuel SDK.
 *
 * @returns {object} An object containing:
 * - `provider`: The provider data or `null`.
 * - Additional properties from `useNamedQuery`.
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
