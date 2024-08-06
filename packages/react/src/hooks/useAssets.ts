import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

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
