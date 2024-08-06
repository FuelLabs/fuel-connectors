import type { BytesLike } from 'fuels';
import { Address } from 'fuels';
import { useEffect } from 'react';

import { useNamedQuery } from '../core';
import { QUERY_KEYS } from '../utils';

import { useProvider } from './useProvider';

export const useBalance = ({
  address,
  assetId,
}: {
  address?: string;
  assetId?: BytesLike;
}) => {
  const { provider } = useProvider();

  const query = useNamedQuery('balance', {
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
    initialData: null,
    enabled: !!provider,
  });

  useEffect(() => {
    const listenerAccountFetcher = () => {
      query.refetch();
    };

    window.addEventListener('focus', listenerAccountFetcher);

    return () => {
      window.removeEventListener('focus', listenerAccountFetcher);
    };
  }, [query]);

  return query;
};
