import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

/**
 * `useAccount` is a React hook that returns the current account of the user.
 * A hook to get the current account of the user in the connected app
 *
 * @returns {object} An object containing:
 * - `account`: The current account of the user.
 * - Additional properties from `useNamedQuery`.
 *
 * @see {@link https://github.com/FuelLabs/fuels-ts/blob/master/packages/account/src/connectors/fuel-connector.ts | fuel-connector.ts on `FuelLabs/fuel-ts`}
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
