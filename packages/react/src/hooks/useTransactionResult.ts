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

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to fetch the result of a specific transaction in the connected app.
 *
 * @template TTransactionType - The type of the transaction.
 * @template TName - The name of the query, defaults to 'transactionResult'.
 * @template TData - The type of the data returned by the query, defaults to `TransactionResult<TTransactionType> | null`.
 *
 * @param {UseTransactionResultParams<TTransactionType, TName, TData>} params - Parameters to configure the hook.
 * @returns {object} An object containing
 * - `transactionResult`: The result of the transaction or `null`.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | Properties of `@tanstack/react-query`, `useQuery` method}.
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
