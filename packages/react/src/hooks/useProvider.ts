import { keepPreviousData } from '@tanstack/react-query';
import type { Provider } from 'fuels';
import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';
import { useAccount } from './useAccount';
import { useNetwork } from './useNetwork';

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
  const { fuel } = useFuel();
  const networkQuery = useNetwork();
  const accountQuery = useAccount();
  const account = accountQuery.account;

  return useNamedQuery(
    'provider',
    {
      queryKey: QUERY_KEYS.provider(account),
      queryFn: async () => {
        if (!account) {
          throw new Error('No account connected');
        }

        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject('Time out fetching provider'), 1000),
        ) as Promise<Provider | null>;

        const provider = fuel
          .getWallet(account)
          .then((wallet) => wallet.provider);

        return Promise.race([provider, timeout]);
      },
      enabled: !!account,
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
    accountQuery.isFetching || networkQuery.isFetching,
  );
};
