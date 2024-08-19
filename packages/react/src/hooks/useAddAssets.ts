import { useMutation } from '@tanstack/react-query';
import type { Asset } from 'fuels';

import { useFuel } from '../providers';
import { MUTATION_KEYS } from '../utils';

/**
 * `useAddAssets` is a React Hook to add one or more assets asynchronously or synchronously.
 * The accounts is fetched using the connected connector's `addAssets` method.
 *
 * @returns {object} An object containing:
 * - `addAssets`: function to add assets synchronously
 * - `addAssetsAsync`: function to add assets asynchronously.
 * - Additional properties from `useMutation`.
 *
 * @see {@link https://github.com/FuelLabs/fuels-ts/blob/master/packages/account/src/connectors/fuel-connector.ts | fuel-connector.ts on `FuelLabs/fuel-ts`}
 *
 * @example To add assets synchronously:
 * ```ts
 * const { addAssets } = useAddAssets();
 * addAssets(asset);
 * ```
 *
 * @example To add assets asynchronously:
 * ```ts
 * const { addAssetsAsync } = useAddAssets();
 * await addAssetsAsync([asset1, asset2]);
 * ```
 */
export const useAddAssets = () => {
  const { fuel } = useFuel();

  const { mutate, mutateAsync, ...queryProps } = useMutation({
    mutationKey: [MUTATION_KEYS.addAssets],
    mutationFn: async (assets: Asset | Asset[]) => {
      if (Array.isArray(assets)) {
        return fuel.addAssets(assets);
      }
      return fuel.addAsset(assets);
    },
  });

  return {
    addAssets: mutate,
    addAssetsAsync: mutateAsync,
    ...queryProps,
  };
};
