import type { Network } from 'fuels';
import { createContext, useContext } from 'react';

const context = createContext<Network['chainId'] | null | undefined>(null);

/**
 * A hook that returns the target chain id for the active provider.
 *
 * @examples
 * ```ts
 * const { chainId } = useFuelChain();
 * console.log(chainId);
 * ```
 */
export function useFuelChain() {
  const contextData = useContext(context);

  if (contextData === null) {
    throw new Error('useFuelChain must be used within a FuelChainProvider');
  }
  return { chainId: contextData };
}

export const FuelChainProvider = context.Provider;
