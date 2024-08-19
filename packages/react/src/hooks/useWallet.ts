import { Address } from 'fuels';

import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

/**
 * `useWallet` is a React Hook to fetch and manage a wallet by its address.
 *
 * @param {string | null} address - The wallet address to fetch. If not provided, the current account's address will be used.
 * @returns {object} An object containing:
 * - `wallet`: The wallet or `null` if the wallet could not be fetched or the address is invalid.
 * - Additional properties from `useNamedQuery`.
 *
 * @example To get a wallet by address
 * ```ts
 * const { wallet } = useWallet('0x...');
 * ```
 * @example To get the current account's wallet
 * ```ts
 * const { wallet } = useWallet();
 * ```
 */
export const useWallet = (address?: string | null) => {
  const { fuel } = useFuel();

  return useNamedQuery('wallet', {
    queryKey: QUERY_KEYS.wallet(address),
    queryFn: async () => {
      try {
        const accountAddress = address || (await fuel.currentAccount()) || '';
        // Check if the address is valid
        await Address.fromString(accountAddress);
        const wallet = await fuel.getWallet(accountAddress);
        return wallet || null;
      } catch (_error: unknown) {
        return null;
      }
    },
    initialData: null,
  });
};
