import {
  TransactionResponse,
  type TransactionResult,
  type TransactionType,
} from 'fuels';

import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';
import { useChainId } from './useChainId';
import { useProvider } from './useProvider';

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
 * @params {UseTransactionResultParams<TTransactionType, TName, TData>} Parameters to configure the hook.
 * - `txId`: A string value representing the transaction ID.
 * - `query`: Additional query parameters to customize the behavior of `useNamedQuery`.
 *
 * @returns {object} An object containing
 * - `transactionResult`: The result of the transaction or `null`.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 * To fetch the result of a transaction:
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
  const { provider } = useProvider();
  const { chainId } = useChainId();
  const { name = 'transactionResult', ...options } = query;

  return useNamedQuery(name, {
    queryKey: QUERY_KEYS.transactionResult(txId, chainId),
    queryFn: async () => {
      if (!provider) return null;

      const txResult = new TransactionResponse(
        txId,
        provider,
        await provider.getChainId(),
      );
      const data = await txResult.waitForResult<TTransactionType>();

      return data || null;
    },
    placeholderData: null,
    enabled: !!txId,
    ...options,
  });
};
