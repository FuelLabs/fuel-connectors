import type { Account } from 'fuels';
import { useMemo } from 'react';
import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { useWallet } from './useWallet';

type UseProviderParams = {
  /**
   * The wallet address used to fetch the provider. If not provided, the current account's address will be used.
   */
  account?: string | null;
  query?: UseNamedQueryParams<'wallet', Account | null, Error, Account | null>;
};

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to retrieve the current provider in the connected app.
 *
 * @returns {object} An object containing:
 * - `provider`: The provider data or `null`.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 * To get the current provider:
 * ```ts
 * const { provider } = useProvider();
 * ```
 */
export const useProvider = (params?: UseProviderParams) => {
  const walletQuery = useWallet(params);
  return useMemo(
    () => ({ provider: walletQuery?.wallet?.provider }),
    [walletQuery.wallet?.provider],
  );
};
