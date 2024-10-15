import { keepPreviousData } from '@tanstack/react-query';
import { Provider } from 'fuels';
import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { QUERY_KEYS } from '../utils';
import { useNetwork } from './useNetwork';

type UseNetworkProviderParams = {
  networkUrl?: string;
  chainId?: number;
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<
    'networkProvider',
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
 * const { networkProvider } = useNetworkProvider();
 * ```
 */
export const useNetworkProvider = (params?: UseNetworkProviderParams) => {
  const networkQuery = useNetwork();
  const currentNetwork = networkQuery.network;
  const networkUrl = params?.networkUrl || currentNetwork?.url;
  const chainId = params?.chainId || currentNetwork?.chainId;

  return useNamedQuery(
    'networkProvider',
    {
      queryKey: QUERY_KEYS.networkProvider(networkUrl, chainId),
      queryFn: async () => {
        async function fetchProvider() {
          if (!networkUrl) {
            throw new Error(
              'Please provide a networks with a RPC url configuration to your FuelProvider getProvider will be removed.',
            );
          }
          const provider = await Provider.create(networkUrl);
          if (chainId && provider.getChainId() !== chainId) {
            throw new Error(
              `The provider's chainId (${provider.getChainId()}) does not match the current network's chainId (${chainId})`,
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
    },
    undefined,
  );
};
