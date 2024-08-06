import { useMutation } from '@tanstack/react-query';

import { useFuel } from '../providers';

export const useConnect = () => {
  const { fuel } = useFuel();

  const { mutate, mutateAsync, ...mutateProps } = useMutation({
    mutationFn: async (connectorName?: string | null) => {
      if (connectorName) {
        await fuel.selectConnector(connectorName);
      }
      return fuel.connect();
    },
  });

  return {
    connect: mutate,
    connectAsync: mutateAsync,
    ...mutateProps,
  };
};
