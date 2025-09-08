import type { BN, BytesLike } from 'fuels';
import { Address } from 'fuels';

import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { QUERY_KEYS } from '../utils';

import { useEffect, useState } from 'react';
import { useProvider } from './useProvider';

type UseBalanceParams = {
  /**
   * The address to fetch the balance for.
   * @deprecated Use `account` instead.
   */
  address?: string | null;
  /**
   * The account to fetch the balance for.
   */
  account?: string | null;
  /**
   * The asset ID to fetch the balance for.
   */
  assetId?: BytesLike;
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<'balance', BN | null, Error, BN | null>;
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
export const useBalance = ({
  address,
  account,
  assetId,
  query,
}: UseBalanceParams) => {
  const { provider } = useProvider();
  const _address = account ?? address ?? undefined;
  const [chainId, setChainId] = useState<number | undefined>();

  useEffect(() => {
    const getChainId = async () => {
      const chainId = await provider?.getChainId();
      setChainId(chainId);
    };
    getChainId();
  }, [provider]);

  return useNamedQuery('balance', {
    queryKey: QUERY_KEYS.balance(_address, assetId, chainId),
    queryFn: async () => {
      try {
        if (!provider) throw new Error('Provider is needed');

        const baseAssetId = assetId || (await provider.getBaseAssetId());
        const currentFuelBalance = await provider.getBalance(
          Address.fromString(_address || ''),
          baseAssetId,
        );
        return currentFuelBalance || null;
      } catch (_error: unknown) {
        return null;
      }
    },
    placeholderData: null,
    enabled: !!provider && !!_address,
    ...query,
  });
};
