import { useMutation } from '@tanstack/react-query';

import { useFuel } from '../providers';

/**
 * `useDisconnect` is a React hook that disconnects a connected connector.
 * The action is done by using the connected connector's `disconnect` method.
 *
 * @see {@link https://github.com/FuelLabs/fuels-ts/blob/master/packages/account/src/connectors/fuel-connector.ts | fuel-connector.ts on `FuelLabs/fuel-ts`}
 *
 * @returns {object} An object containing:
 * - `disconnect`: A function to trigger the disconnection process synchronously.
 * - `disconnectAsync`: A function to trigger the disconnection process asynchronously.
 * - Additional properties from `useMutation` for further control and status tracking.
 *
 * @example To disconnect synchronously:
 * ```ts
 * const { disconnect } = useDisconnect();
 * disconnect();
 * ```
 *
 * @example To disconnect asynchronously:
 * ```ts
 * const { disconnectAsync } = useDisconnect();
 * await disconnectAsync();
 * ```
 */
export const useDisconnect = () => {
  const { fuel } = useFuel();

  const { mutate, mutateAsync, ...mutateProps } = useMutation({
    mutationFn: async () => {
      return fuel?.disconnect();
    },
  });

  return {
    disconnect: mutate,
    disconnectAsync: mutateAsync,
    ...mutateProps,
  };
};
