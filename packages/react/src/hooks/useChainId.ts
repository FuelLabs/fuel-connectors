// should import ChainInfo because of this error: https://github.com/FuelLabs/fuels-ts/issues/1054
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ChainInfo } from 'fuels';
import type { UseNamedQueryParams } from '../core';

import { useNamedQuery } from '../core';
import { QUERY_KEYS } from '../utils';

import { useProvider } from './useProvider';

type UseChainParams<TName extends string, TData> = {
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<TName, TData, Error, TData>;
};

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook that returns the chain ID for the current provider.
 *
 * @returns {object} An object containing:
 * - `chainId`: The current chain ID.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 * ```ts
 * const { chainId } = useChainId();
 * console.log(chainId);
 * ```
 */
export const useChainId = (
  params?: UseChainParams<'chainId', number | null>,
) => {
  const { provider } = useProvider();

  return useNamedQuery('chainId', {
    queryKey: QUERY_KEYS.chainId(),
    queryFn: async () => {
      try {
        const currentFuelChain = await provider?.getChainId();
        return currentFuelChain || null;
      } catch (_error: unknown) {
        return null;
      }
    },
    placeholderData: null,
    enabled: !!provider,
    ...params?.query,
  });
};
