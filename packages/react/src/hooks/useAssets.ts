import { Asset } from 'fuels';
import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

/**
 * `useAssets` is a React hook that returns assets of the user.
 * The assets is fetched using the connected connector's `assets` method.
 *
 * @returns {object} An object containing
 * - `assets`: User's assets.
 * - Additional properties from `useNamedQuery`.
 *
 * @see {@link https://github.com/FuelLabs/fuels-ts/blob/master/packages/account/src/connectors/fuel-connector.ts | fuel-connector.ts on `FuelLabs/fuel-ts`}
 *
 * @example
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
