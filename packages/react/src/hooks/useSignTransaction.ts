import { useMutation } from '@tanstack/react-query';
import {
  Address,
  type FuelConnectorSendTxParams,
  type TransactionRequestLike,
} from 'fuels';

import { useCurrentConnector } from './useCurrentConnector';

type MutationParams = {
  /**
   * The address to sign the transaction from. Can be a string or an Address.
   */
  address: string | Address;
  /**
   * The transaction request object that defines the transaction details.
   */
  transaction: TransactionRequestLike;
  /**
   * Optional parameters for the transaction.
   */
  params?: FuelConnectorSendTxParams;
};

/**
 * A hook to sign transactions in the connected app without sending them.
 *
 * @params {Object} The parameters to sign a transaction.
 * - `address`: The address to sign the transaction from.
 * - `transaction`: The transaction request object that defines the transaction details.
 * - `params`: Optional parameters for the transaction.
 *
 * @returns {Object} Methods to sign transactions.
 * - `signTransaction`: function to sign a transaction synchronously.
 * - `signTransactionAsync`: function to sign a transaction asynchronously.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useMutation | `...mutationProps`}: Destructured properties from `useMutation` result.
 *
 * @examples
 * To sign a transaction synchronously:
 * ```ts
 * const { signTransaction } = useSignTransaction();
 * signTransaction({ address: '0x...', transaction: {...}, params: { provider: { url: 'http://...' } } });
 * ```
 *
 * To sign a transaction asynchronously:
 * ```ts
 * const { signTransactionAsync } = useSignTransaction();
 * await signTransactionAsync({ address: '0x...', transaction: {...}, params: { provider: { url: 'http://...' } } });
 * ```
 */
export const useSignTransaction = () => {
  const { currentConnector } = useCurrentConnector();

  const { mutate, mutateAsync, ...queryProps } = useMutation({
    mutationFn: async ({ address, transaction, params }: MutationParams) => {
      if (!currentConnector) {
        throw new Error('No connector found, please connect first');
      }

      const connector = currentConnector;
      if (!connector.connected) {
        throw new Error('Connector not connected');
      }

      // Check if the connector supports signTransaction
      if (!('signTransaction' in connector)) {
        throw new Error('Connector does not support signTransaction');
      }

      const source = new Address(address).toString();

      return connector.signTransaction(source, transaction, params);
    },
  });

  return {
    signTransaction: mutate,
    signTransactionAsync: mutateAsync,
    ...queryProps,
  };
};
