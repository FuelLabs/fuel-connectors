import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

/**
 * A hook to get the accounts of the user in the connected app.
 *
 * @returns {object} An object containing:
 * - `accounts`: User accounts.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | Properties of `@tanstack/react-query`, `useQuery` method}.
 * @todo Add a link to fuel connector's documentation.
 * @see {@link https://github.com/FuelLabs/fuels-connectors/blob/master/packages/docs/src/guide/react-hooks/hooks-reference.md | Hook Reference in Fuel Connectors Documentation}
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
