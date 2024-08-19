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
 * `useSendTransaction` is a React Hook to send transactions using the Fuel SDK.
 * The transaction is sent to the specified address using the connected connector's `sendTransaction` method.
 *
 * @see {@link https://github.com/FuelLabs/fuels-ts/blob/master/packages/account/src/connectors/fuel-connector.ts | fuel-connector.ts on `FuelLabs/fuel-ts`}
 *
 * @typedef {Object} UseSendTransactionResult
 * @property {(params: UseSendTransactionParams) => string} sendTransaction A function to send a transaction synchronously.
 * @property {(params: UseSendTransactionParams) => string} sendTransactionAsync A function to send a transaction asynchronously.
 * @property {Object} queryProps Additional properties from `useMutation`.
 *
 * @returns {UseSendTransactionResult} Methods to send transactions.
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
