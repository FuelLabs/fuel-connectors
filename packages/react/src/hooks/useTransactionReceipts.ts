import { TransactionResponse } from 'fuels';
// should import BN because of this TS error: https://github.com/microsoft/TypeScript/issues/47663
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { TransactionResult } from 'fuels';

import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { QUERY_KEYS } from '../utils';
import { useProvider } from './useProvider';

type UseTransactionReceiptsParams<TTransactionType = void> = {
  /**
   * The transaction ID to fetch the receipts for.
   */
  txId?: string;
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<
    'transactionReceipts',
    TransactionResult<TTransactionType>['receipts'] | null,
    Error,
    TransactionResult<TTransactionType>['receipts'] | null
  >;
};

/**
 * @deprecated
 *
 * Use `useTransactionResult` instead with `select` function in the `query` parameter.
 */
export const useTransactionReceipts = <TTransactionType = void>({
  txId,
  query,
}: UseTransactionReceiptsParams<TTransactionType>) => {
  const { provider } = useProvider();

  return useNamedQuery('transactionReceipts', {
    queryKey: QUERY_KEYS.transactionReceipts(txId, provider),
    queryFn: async () => {
      try {
        if (!provider) return null;

        const response = new TransactionResponse(
          txId || '',
          provider,
          await provider.getChainId(),
        );
        if (!response) return null;

        const { receipts } = await response.waitForResult();
        return receipts || null;
      } catch (_error: unknown) {
        return null;
      }
    },
    placeholderData: null,
    enabled: !!txId,
    ...query,
  });
};
