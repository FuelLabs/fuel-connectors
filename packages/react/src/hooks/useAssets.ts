import type { Asset } from 'fuels';
import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

type UseAssetsParams<TName extends string, TData> = {
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<TName, TData, Error, TData>;
};

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook that returns assets of the user in the connected app.
 *
 * @returns {object} An object containing
 * - `assets`: User's assets.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 * ```ts
 * const { assets } = useAssets();
 * console.log(assets);
 * ```
 */
export const useAssets = (params?: UseAssetsParams<'assets', Asset[]>) => {
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
    placeholderData: [],
    ...params?.query,
  });
};
