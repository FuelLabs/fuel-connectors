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
  txId?: string;
  query?: UseNamedQueryParams<
    TName,
    TransactionResult<TTransactionType> | null,
    Error,
    TData
  >;
};

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
