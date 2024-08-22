import { useMutation } from '@tanstack/react-query';

import { useFuel } from '../providers';

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook that disconnects a connected connector in the connected app.
 *
 * @returns {object} An object containing:
 * - `disconnect`: A function to trigger the disconnection process synchronously.
 * - `disconnectAsync`: A function to trigger the disconnection process asynchronously.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useMutation | Properties of `@tanstack/react-query`, `useMutation` method}.
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
