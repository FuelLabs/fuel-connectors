import {
  TransactionResponse,
  type TransactionResult,
  type TransactionType,
} from 'fuels';

import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

type UseTransactionResultParams<
  TTransactionType extends TransactionType,
  TName extends string,
  TData,
> = {
  /**
   * The ID of the transaction to retrieve the result for.
   */
  txId?: string;
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<
    TName,
    TransactionResult<TTransactionType> | null,
    Error,
    TData
  >;
};

/**
 * `useTransactionResult` is a React hook to fetch the result of a specific transaction.
 * This hook retrieves the result of a transaction by its ID using the Fuel SDK.
 *
 * @template TTransactionType - The type of the transaction.
 * @template TName - The name of the query, defaults to 'transactionResult'.
 * @template TData - The type of the data returned by the query, defaults to `TransactionResult<TTransactionType> | null`.
 *
 * @param {UseTransactionResultParams<TTransactionType, TName, TData>} params - Parameters to configure the hook.
 * @param {string} params.txId - The ID of the transaction to retrieve the result for.
 * @param {UseNamedQueryParams<TName, TransactionResult<TTransactionType> | null, Error, TData>} params.query - Additional query parameters to customize the behavior of `useNamedQuery`.
 * @returns {object} An object containing
 * - `transactionResult`: The result of the transaction or `null`.
 * - Additional properties from `useNamedQuery`.
 *
 * @example To get a transaction result by its ID
 * ```ts
 * const { transactionResult } = useTransactionResult({
 *   txId: '0x...',
 * });
 * console.log(transactionResult);
 * ```
 */
export const useTransactionResult = <
  TTransactionType extends TransactionType,
  TName extends string = string,
  TData = TransactionResult<TTransactionType> | null,
>({
  txId = '',
  query = {},
}: UseTransactionResultParams<TTransactionType, TName, TData>) => {
  const { fuel } = useFuel();
  const { name = 'transactionResult', ...options } = query;

  return useNamedQuery(name, {
    queryKey: QUERY_KEYS.transactionResult(txId),
    queryFn: async () => {
      const provider = await fuel.getProvider();
      if (!provider) return null;

      const txResult = new TransactionResponse(txId, provider);
      const data = await txResult.waitForResult<TTransactionType>();

      return data || null;
    },
    initialData: null,
    enabled: !!txId,
    ...options,
  });
};
