import { TransactionResponse } from 'fuels';
// should import BN because of this TS error: https://github.com/microsoft/TypeScript/issues/47663
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { TransactionResultReceipt } from 'fuels';

import { useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

/**
 * @deprecated `useTransactionReceipts` is deprecated. Use `useTransactionResult` instead with `select` function in the `query` parameter.
 *
 * `useTransactionReceipts` is a React hook that returns the transaction receipts for the given transaction ID.
 *
 * @param {object} options The options object.
 * @param {string} options.txId The transaction ID.
 * @returns {object} An object containing
 * - `transactionReceipts`: The transaction receipts or `null`.
 * - Additional properties from `useNamedQuery`.
 *
 * @example To get transaction receipts by its ID
 * ```ts
 * const { transactionReceipts } = useTransactionReceipts({
 *   txId: '0x...',
 * });
 * console.log(transactionReceipts);
 * ```
 */
export const useTransactionReceipts = ({ txId }: { txId?: string }) => {
  const { fuel } = useFuel();

  return useNamedQuery('transactionReceipts', {
    queryKey: QUERY_KEYS.transactionReceipts(txId),
    queryFn: async () => {
      try {
        const provider = await fuel.getProvider();
        if (!provider) return null;

        const response = new TransactionResponse(txId || '', provider);
        if (!response) return null;

        const { receipts } = await response.waitForResult();
        return receipts || null;
      } catch (_error: unknown) {
        return null;
      }
    },
    initialData: null,
    enabled: !!txId,
  });
};
