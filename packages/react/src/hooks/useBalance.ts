import type { BN, BytesLike } from 'fuels';
import { Address } from 'fuels';
import { useEffect } from 'react';

import { useNamedQuery } from '../core';
import { QUERY_KEYS } from '../utils';

import { useProvider } from './useProvider';

/**
 * `useAssets` is a React hook that returns assets of the user.
 *
 * @param {object} options - An object containing:
 * @param {string} options.address - The address of the user.
 * @param {string} options.assetId - The assetId of the user.
 * @returns {Promise<BN>} User's balance.
 *
 * @see {@link https://github.com/FuelLabs/fuel-connectors/blob/main/packages/react/src/hooks/useProvider.ts | useProvider.ts}
 *
 * @example
 * ```ts
 * const { balance } = useBalance({address: '0x1234', assetId: '0x1234'});
 * console.log(balance.format());
 * ```
 */
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
