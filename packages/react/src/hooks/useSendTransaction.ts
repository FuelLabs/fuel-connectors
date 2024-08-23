import { useMutation } from '@tanstack/react-query';
import {
  type AbstractAddress,
  Address,
  type TransactionRequestLike,
} from 'fuels';

import { useFuel } from '../providers';

type UseSendTransactionParams = {
  /**
   * The address to send the transaction to. Can be a string or an AbstractAddress.
   */
  address: string | AbstractAddress;
  /**
   * The transaction request object that defines the transaction details.
   */
  transaction: TransactionRequestLike;
};

/**
 * A hook to send transactions in the connected app.
 *
 * @params {UseSendTransactionParams} params The parameters to send a transaction.
 * @returns {Object} Methods to send transactions.
 * - `sendTransaction`: function to send a transaction synchronously.
 * - `sendTransactionAsync`: function to send a transaction asynchronously.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useMutation | Properties of `@tanstack/react-query`, `useMutation` method}.
 * @todo Add a link to fuel connector's documentation.
 * @see {@link https://github.com/FuelLabs/fuels-connectors/blob/master/packages/docs/src/guide/react-hooks/hooks-reference.md | Hook Reference in Fuel Connectors Documentation}
 *
 * ```ts To send a transaction synchronously
 * @example
 * const { sendTransaction } = useSendTransaction();
 * sendTransaction({ address: '0x...', transaction: {...} });
 * ```
 *
 * ```ts To send a transaction asynchronously
 * @example
 * const { sendTransactionAsync } = useSendTransaction();
 * await sendTransactionAsync({ address: '0x...', transaction: {...} });
 * ```
 */
export const useSendTransaction = () => {
  const { fuel } = useFuel();

  const { mutate, mutateAsync, ...queryProps } = useMutation({
    mutationFn: ({ address, transaction }: UseSendTransactionParams) => {
      const destination = Address.fromDynamicInput(address).toString();
      return fuel.sendTransaction(destination, transaction);
    },
  });

  return {
    sendTransaction: mutate,
    sendTransactionAsync: mutateAsync,
    ...queryProps,
  };
};
