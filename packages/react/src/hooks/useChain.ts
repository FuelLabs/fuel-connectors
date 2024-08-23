// should import ChainInfo because of this error: https://github.com/FuelLabs/fuels-ts/issues/1054
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ChainInfo } from 'fuels';

import { useNamedQuery } from '../core';
import { QUERY_KEYS } from '../utils';

import { useProvider } from './useProvider';

/**
 * A hook that returns the chain info for the current provider.
 *
 * @returns {object} An object containing:
 * - `chain`: The current chain info.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | Properties of `@tanstack/react-query`, `useQuery` method}.
 * @todo Add a link to fuel connector's documentation.
 * @see {@link https://github.com/FuelLabs/fuels-connectors/blob/master/packages/docs/src/guide/react-hooks/hooks-reference.md | Hook Reference in Fuel Connectors Documentation}
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
