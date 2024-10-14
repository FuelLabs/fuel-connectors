import { useMutation } from '@tanstack/react-query';
import type { Asset } from 'fuels';

import { useFuel } from '../providers';
import { MUTATION_KEYS } from '../utils';

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to add one or more assets in the connected app asynchronously or synchronously.
 *
 * @returns {object} An object containing:
 * - `addAssets`: function to add assets synchronously.
 * - `addAssetsAsync`: function to add assets asynchronously.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useMutation | `...mutationProps`}: Destructured properties from `useMutation` result.
 *
 * @examples
 *  To add assets synchronously:
 * ```ts
 * const { addAssets } = useAddAssets();
 * addAssets(asset);
 * ```
 *
 * To add assets asynchronously:
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
