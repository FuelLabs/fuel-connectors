import type { BN, BytesLike } from 'fuels';
import { Address } from 'fuels';
import { useEffect } from 'react';

import { useNamedQuery } from '../core';
import { QUERY_KEYS } from '../utils';

import { useProvider } from './useProvider';

type UseBalanceParams = {
  /**
   * The address to fetch the balance for.
   */
  address?: string;
  /**
   * The asset ID to fetch the balance for.
   */
  assetId?: BytesLike;
};

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook that returns the balance of the user.
 *
 * @params {object} The options to fetch the balance for.
 * - `address`: The address to fetch the balance for.
 * - `assetId`: The asset ID to fetch the balance for.
 *
 * @returns {object} An object containing:
 * - `balance`: The balance of the user.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 * ```ts
 * const { balance } = useBalance({address: '0x1234', assetId: '0x1234'});
 * console.log(balance.format());
 * ```
 */
export const useBalance = ({ address, assetId }: UseBalanceParams) => {
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
