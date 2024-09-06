import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

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
