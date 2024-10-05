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
 * A hook that returns the chain info for the current provider.
 *
 * @returns {object} An object containing:
 * - `chain`: The current chain info.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 * ```ts
 * const { chain } = useChain();
 * console.log(chain);
 * ```
 */
export const useChain = (
  params?: UseChainParams<'chain', ChainInfo | null>,
) => {
  const { provider } = useProvider();

  return useNamedQuery('chain', {
    queryKey: QUERY_KEYS.chain(),
    queryFn: async () => {
      try {
        const currentFuelChain = await provider?.getChain();
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
