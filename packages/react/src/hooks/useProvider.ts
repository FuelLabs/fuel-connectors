import { Provider } from 'fuels';
import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

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
  const { fuel, networks } = useFuel();
  return useNamedQuery('provider', {
    queryKey: QUERY_KEYS.provider(),
    queryFn: async () => {
      const currentNetwork = await fuel.currentNetwork();
      const network = networks.find(
        (n) => n.chainId === currentNetwork.chainId,
      );
      if (!network?.url) {
        const provider = await fuel.getProvider();
        console.warn(
          'Please provide a networks with a RPC url configuration to your FuelProvider getProvider will be removed.',
        );
        return provider || null;
      }
      const provider = await Provider.create(network.url);
      if (provider.getChainId() !== currentNetwork.chainId) {
        throw new Error(
          `The provider's chainId (${provider.getChainId()}) does not match the current network's chainId (${
            currentNetwork.chainId
          })`,
        );
      }
      return provider;
    },
    initialData: null,
    ...params?.query,
  });
};
