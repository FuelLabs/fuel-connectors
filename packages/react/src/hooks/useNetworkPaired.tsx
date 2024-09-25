import { useMemo, useState } from 'react';
import { NATIVE_CONNECTORS } from '../config';
import { useFuel, useFuelChain } from '../providers';
import { useWallet } from './useWallet';

/**
 * A hook to check if the current network is paired with the wallet.
 *
 * @returns {boolean | null} - Returns true if the network is paired with the wallet, false if not, or null if the connector is not valid.
 * @examples
 * ```ts
 * const networkPaired = useNetworkPaired();
 * console.log(networkPaired);
 * ```
 */
export function useNetworkPaired() {
  const { fuel } = useFuel();
  const { wallet } = useWallet();
  const { chainId } = useFuelChain();
  const walletChainId = wallet?.provider.getChainId();

  const currentConnector = fuel.currentConnector();
  // Fix hydration problem between nextjs render and frontend render
  // UI was not getting updated and theme colors was set wrongly
  // see more here https://nextjs.org/docs/messages/react-hydration-error
  const validConnector =
    !!currentConnector &&
    NATIVE_CONNECTORS.includes(currentConnector?.name) &&
    currentConnector.connected;

  return useMemo(() => {
    if (!validConnector || walletChainId == null) {
      return null;
    }
    return walletChainId === chainId;
  }, [chainId, validConnector, walletChainId]);
}
