import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

/**
 * `useAccounts` is a React hook that returns accounts of the user.
 * The accounts is fetched using the connected connector's `accounts` method.
 *
 * @returns {object} An object containing:
 * - `accounts`: User accounts.
 * - Additional properties from `useNamedQuery`.
 *
 * @see {@link https://github.com/FuelLabs/fuels-ts/blob/master/packages/account/src/connectors/fuel-connector.ts | fuel-connector.ts on `FuelLabs/fuel-ts`}
 *
 * @example
 * ```ts
 * const { accounts } = useAccounts();
 * console.log(accounts);
 * ```
 */
export const useAccounts = () => {
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
  });
};
