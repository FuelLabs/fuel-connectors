import { type Account, Address } from 'fuels';

import {
  type DefinedNamedUseQueryResult,
  type UseNamedQueryParams,
  useNamedQuery,
} from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';
import { useAccount } from './useAccount';
import { useNetwork } from './useNetwork';

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
) {
  const { fuel } = useFuel();
  const { network } = useNetwork();
  const { account } = useAccount();

  const _params: UseWalletParams =
    typeof params === 'string' ? { account: params } : params ?? {};

  // console.log(`asd account`, account);
  // console.log(`asd network?.url`, network?.url);

  const queried = useNamedQuery('wallet', {
    queryKey: QUERY_KEYS.wallet(account, network?.url),
    queryFn: async () => {
      try {
        console.log('asd start querying useWallet', account, network?.url);
        if (!account || !network?.url) return null;
        await Address.fromString(account);
        const wallet = await fuel.getWallet(account);
        console.log('asd completed querying useWallet', wallet);
        return wallet;
      } catch (_error: unknown) {
        return null;
      }
    },
    enabled: !!account && !!network?.url,
    placeholderData: null,
    ..._params.query,
  });

  // console.log(`asd queried.wallet`, queried.wallet);

  return queried;
}
