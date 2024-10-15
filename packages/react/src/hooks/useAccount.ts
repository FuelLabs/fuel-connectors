import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

type UseAccountParams<TName extends string, TData> = {
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<TName, TData, Error, TData>;
};

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to get the current account of the user in the connected app.
 *
 * @returns {object} An object containing:
 * - `account`: The current account of the user.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 * ```ts
 * const { account } = useAccount();
 * console.log(account);
 * ```
 */
export const useAccount = (
  params?: UseAccountParams<'account', string | null>,
) => {
  const { fuel } = useFuel();

  return useNamedQuery('account', {
    queryKey: QUERY_KEYS.account(fuel.name),
    queryFn: async () => {
      return await fuel?.currentAccount();
    },
    placeholderData: null,
    retry: 5,
    retryDelay: 100,
    ...params?.query,
  });
};
