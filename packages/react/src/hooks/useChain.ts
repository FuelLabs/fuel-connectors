// should import ChainInfo because of this error: https://github.com/FuelLabs/fuels-ts/issues/1054
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ChainInfo } from 'fuels';

import { useMemo } from 'react';
import { useProvider } from './useProvider';

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
export const useChain = () => {
  const providerData = useProvider();
  const provider = providerData?.provider;

  return useMemo(() => {
    try {
      const currentFuelChain = provider?.getChain();
      return { chain: currentFuelChain || null };
    } catch (e) {
      console.error(e);
      return { provider: null };
    }
  }, [provider]);
};
