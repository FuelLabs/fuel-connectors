import { keepPreviousData } from '@tanstack/react-query';
import { FuelConnectorEventTypes } from 'fuels';
import { useEffect } from 'react';
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

  const accountQuery = useNamedQuery('account', {
    queryKey: QUERY_KEYS.account(fuel.name),
    queryFn: async () => {
      try {
        const currentFuelAccount = await fuel?.currentAccount();
        return currentFuelAccount;
      } catch (_error: unknown) {
        return null;
      }
    },
    placeholderData: null,
    retry: 5,
    ...params?.query,
  });

  useEffect(() => {
    const sub = fuel.on(FuelConnectorEventTypes.currentAccount, () => {
      accountQuery.refetch();
    });
    return () => {
      sub.unsubscribe();
    };
  }, [fuel, accountQuery.refetch]);

  return accountQuery;
};
