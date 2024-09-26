import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

type UseAccountsParams<TName extends string, TData> = {
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<TName, TData, Error, TData>;
};

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to get the accounts of the user in the connected app.
 *
 * @returns {object} An object containing:
 * - `accounts`: User accounts.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 * ```ts
 * const { accounts } = useAccounts();
 * console.log(accounts);
 * ```
 */
export const useAccounts = (
  params?: UseAccountsParams<'accounts', string[]>,
) => {
  const { fuel } = useFuel();

  return useNamedQuery('accounts', {
    queryKey: QUERY_KEYS.accounts(),
    queryFn: async () => {
      try {
        const accounts = await fuel.accounts();
        return accounts;
      } catch (_error: unknown) {
        return [];
      }
    },
    initialData: [],
    ...params?.query,
  });
};
