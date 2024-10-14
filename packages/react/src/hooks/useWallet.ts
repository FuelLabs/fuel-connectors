import { type Account, Address, FuelConnectorEventTypes } from 'fuels';

import { keepPreviousData } from '@tanstack/react-query';
import {
  type DefinedNamedUseQueryResult,
  type UseNamedQueryParams,
  useNamedQuery,
} from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';
import { useAccount } from './useAccount';

type UseWalletParamsDeprecated = string | null;

type UseWalletParams = {
  /**
   * The wallet address to fetch. If not provided, the current account's address will be used.
   */
  account?: string | null;
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<'wallet', Account | null, Error, Account | null>;
};

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to fetch and manage a wallet by its address in the connected app.
 *
 * @params {object} The parameters to fetch a wallet.
 * - `address`: The wallet address to fetch. If not provided, the current account's address will be used.
 *
 * @returns {object} An object containing:
 * - `wallet`: The wallet or `null` if the wallet could not be fetched or the address is invalid.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 * To get a wallet by address:
 * ```ts
 * const { wallet } = useWallet({ account: '0x...' });
 * ```
 * To get the current account's wallet:
 * ```ts
 * const { wallet } = useWallet();
 * ```
 */
export function useWallet(
  params?: UseWalletParams,
): DefinedNamedUseQueryResult<'wallet', Account | null, Error>;

/**
 * @deprecated Use `useWallet({ account })` instead.
 */
export function useWallet(
  params?: UseWalletParamsDeprecated,
): DefinedNamedUseQueryResult<'wallet', Account | null, Error>;

export function useWallet(
  params?: UseWalletParamsDeprecated | UseWalletParams,
): DefinedNamedUseQueryResult<'wallet', Account | null, Error> {
  const { fuel } = useFuel();
  const accountData = useAccount();
  const _params: UseWalletParams =
    typeof params === 'string' ? { account: params } : params ?? {};
  const account = _params.account || accountData?.account;
  return useNamedQuery('wallet', {
    queryKey: QUERY_KEYS.wallet(account, fuel.name),
    queryFn: async () => {
      try {
        if (!account) return null;
        // Check if the address is valid
        await Address.fromString(account);
        const wallet = await fuel.getWallet(account);
        wallet.connect(wallet.provider);
        return wallet || null;
      } catch (_error: unknown) {
        return null;
      }
    },
    enabled: !!account,
    placeholderData: keepPreviousData,
    ..._params.query,
  });
}
