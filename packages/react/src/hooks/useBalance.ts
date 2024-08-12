import type { BN, BytesLike } from 'fuels';
import { Address } from 'fuels';

import { type ServiceOptions, useNamedQuery } from '../core';
import { QUERY_KEYS } from '../utils';

import { useProvider } from './useProvider';

type UseBalanceParams = {
  address?: string;
  assetId?: BytesLike;
};

export const useBalance = (
  { address, assetId }: UseBalanceParams,
  options?: ServiceOptions<unknown, Error, BN | null>,
) => {
  const { provider } = useProvider();
  return useNamedQuery('balance', {
    ...options,
    queryKey: QUERY_KEYS.balance(address, assetId),
    queryFn: async () => {
      try {
        if (!provider) throw new Error('Provider is needed');

        const baseAssetId = assetId || provider.getBaseAssetId();
        const currentFuelBalance = await provider.getBalance(
          Address.fromString(address || ''),
          baseAssetId,
        );
        return currentFuelBalance || null;
      } catch (_error: unknown) {
        return null;
      }
    },
    refetchOnWindowFocus: true,
    initialData: null,
    enabled: !!provider,
  });
};
