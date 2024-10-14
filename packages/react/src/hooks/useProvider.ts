import { keepPreviousData } from '@tanstack/react-query';
import { Provider } from 'fuels';
import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';
import { useAccount } from './useAccount';
import { useNetwork } from './useNetwork';

type UseProviderParams = {
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
  const { account } = useAccount();
  const currentNetwork = networkQuery.network;

  return useNamedQuery('provider', {
    queryKey: QUERY_KEYS.provider(account, currentNetwork),
    queryFn: async () => {
      async function fetchProvider() {
        if (!currentNetwork?.url) {
          console.warn(
            'Please provide a networks with a RPC url configuration to your FuelProvider getProvider will be removed.',
          );
        }
        if (account) {
          const provider = await fuel.getWallet(account);
          return provider.provider || null;
        }
        if (!currentNetwork?.url) {
          return fuel.getProvider();
        }
        const provider = await Provider.create(currentNetwork.url);
        if (provider.getChainId() !== currentNetwork.chainId) {
          throw new Error(
            `The provider's chainId (${provider.getChainId()}) does not match the current network's chainId (${
              currentNetwork.chainId
            })`,
          );
        }
        return provider;
      }

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject('Time out fetching provider'), 1000),
      ) as Promise<Provider | null>;

      return Promise.race([fetchProvider(), timeout]);
    },
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
  });
};
