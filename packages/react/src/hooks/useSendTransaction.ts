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

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to send transactions in the connected app.
 *
 * @params {Object} The parameters to send a transaction.
 * - `address`: The address to send the transaction to.
 * - `transaction`: The transaction request object that defines the transaction details.
 *
 * @returns {Object} Methods to send transactions.
 * - `sendTransaction`: function to send a transaction synchronously.
 * - `sendTransactionAsync`: function to send a transaction asynchronously.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useMutation | Properties of `@tanstack/react-query`, `useMutation` method}.
 *
 * @examples
 * To send a transaction synchronously:
 * ```ts
 * const { sendTransaction } = useSendTransaction();
 * sendTransaction({ address: '0x...', transaction: {...} });
 * ```
 *
 * To send a transaction asynchronously:
 * ```ts
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
