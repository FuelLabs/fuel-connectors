import { keepPreviousData } from '@tanstack/react-query';
import type { Provider } from 'fuels';
import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { QUERY_KEYS } from '../utils';
import { useWallet } from './useWallet';

type UseProviderParams = {
  networkUrl?: string;
  chainId?: number;
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<
    'provider',
    Provider | null,
    Error,
    Provider | null
  >;
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
  const walletQuery = useWallet();

  return useNamedQuery(
    'provider',
    {
      queryKey: QUERY_KEYS.provider(walletQuery.wallet?.address.toString()),
      queryFn: async () => {
        if (!walletQuery.wallet) {
          throw new Error('No wallet connected');
        }
        return walletQuery.wallet.provider || null;
      },
      enabled: !!walletQuery.wallet,
      placeholderData: keepPreviousData,
      refetchInterval: (e) => {
        if (!e.state.data || e.state.error) {
          return 500;
        }
        return false;
      },
      retry: (attempts) => {
        if (attempts > 10) {
          return false;
        }
        return true;
      },
      ...params?.query,
    },
    undefined,
    walletQuery.isFetching,
  );
};
