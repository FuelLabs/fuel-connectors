import { Asset } from 'fuels';
import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook that returns assets of the user in the connected app.
 *
 * @returns {object} An object containing
 * - `assets`: User's assets.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | Properties of `@tanstack/react-query`, `useQuery` method}.
 *
 * @examples
 * ```ts
 * const { assets } = useAssets();
 * console.log(assets);
 * ```
 */
export const useAssets = () => {
  const { fuel } = useFuel();

  return useNamedQuery('assets', {
    queryKey: QUERY_KEYS.assets(),
    queryFn: async () => {
      try {
        const assets = await fuel.assets();
        return assets;
      } catch (_error: unknown) {
        return [];
      }
    },
    initialData: [],
  });
};
