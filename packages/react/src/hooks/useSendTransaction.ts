import { useMutation } from '@tanstack/react-query';
import {
  type AbstractAddress,
  Address,
  type TransactionRequestLike,
} from 'fuels';

import { useFuel } from '../providers';

type UseSendTransactionParams = {
  address: string | AbstractAddress;
  transaction: TransactionRequestLike;
};

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
