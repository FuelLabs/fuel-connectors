// should import ChainInfo because of this error: https://github.com/FuelLabs/fuels-ts/issues/1054
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ChainInfo } from 'fuels';

import { useNamedQuery } from '../core';
import { QUERY_KEYS } from '../utils';

import { useProvider } from './useProvider';

/**
 * `useChain` is a React hook that returns the chain info for the current provider.
 *
 * @returns {Promise<ChainInfo | null>} ChainInfo for the current provider.
 *
 * @see {@link https://github.com/FuelLabs/fuel-connectors/blob/main/packages/react/src/hooks/useProvider.ts | useProvider.ts}
 *
 * @example
 * ```ts
 * const { chain } = useChain();
 * console.log(chain);
 * ```
 */
export const useChain = () => {
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
    initialData: null,
    enabled: !!provider,
  });
};
