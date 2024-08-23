import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

/**
 * A hook to get the current account of the user in the connected app.
 *
 * @returns {object} An object containing:
 * - `account`: The current account of the user.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | Properties of `@tanstack/react-query`, `useQuery` method}.
 * @todo Add a link to fuel connector's documentation.
 * @see {@link https://github.com/FuelLabs/fuels-connectors/blob/master/packages/docs/src/guide/react-hooks/hooks-reference.md | Hook Reference in Fuel Connectors Documentation}
 *
 * @example
 * ```ts
 * const { account } = useAccount();
 * console.log(account);
 * ```
 */
export const useAccount = () => {
  const { fuel } = useFuel();

  return useNamedQuery('account', {
    queryKey: QUERY_KEYS.account(),
    queryFn: async () => {
      try {
        const currentFuelAccount = await fuel?.currentAccount();
        return currentFuelAccount;
      } catch (_error: unknown) {
        return null;
      }
    },
    initialData: null,
  });
};
