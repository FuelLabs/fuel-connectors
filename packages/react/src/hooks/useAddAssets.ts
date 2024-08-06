import { useMutation } from '@tanstack/react-query';
import type { Asset } from 'fuels';

import { useFuel } from '../providers';
import { MUTATION_KEYS } from '../utils';

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
