// TODO: fix this import when sdk error gets fixed: https://github.com/FuelLabs/fuels-ts/issues/1054
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as fuels from 'fuels';

import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to fetch transaction details using a transaction ID in the connected app.
 *
 * @param {string} txId The ID of the transaction to fetch
 *
 * @returns {object} An object containing:
 * - `transaction`: The transaction details retrieved from the provider, or `null` if not found.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | Properties of `@tanstack/react-query`, `useQuery` method}.
 *
 * @example To fetch transaction details
 * ```ts
 * const { transaction, error, isLoading } = useTransaction('0x1234');
 * ```
 */
export const useTransaction = (txId?: string) => {
  const { fuel } = useFuel();

  return useNamedQuery('transaction', {
    queryKey: QUERY_KEYS.transaction(txId),
    queryFn: async () => {
      try {
        const provider = await fuel?.getProvider();
        if (!provider) return null;
        const response = await provider.getTransaction(txId || '');
        return response;
      } catch (_error: unknown) {
        return null;
      }
    },
    initialData: null,
    enabled: !!txId,
  });
};
