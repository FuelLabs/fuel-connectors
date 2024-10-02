import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to disconnect from current connector.
 *
 * @returns {object} An object containing:
 * - `disconnect`: A function to trigger the disconnection process synchronously.
 * - `disconnectAsync`: A function to trigger the disconnection process asynchronously.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useMutation | `...mutationProps`}: Destructured properties from `useMutation` result.
 *
 * @examples
 * To disconnect synchronously:
 * ```ts
 * const { disconnect } = useDisconnect();
 * disconnect();
 * ```
 *
 * To disconnect asynchronously:
 * ```ts
 * const { disconnectAsync } = useDisconnect();
 * await disconnectAsync();
 * ```
 */
export const useDisconnect = () => {
  const { fuel } = useFuel();
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, ...mutateProps } = useMutation({
    mutationFn: async () => {
      return fuel?.disconnect();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallet() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.isConnected() });
    },
  });

  return {
    disconnect: mutate,
    disconnectAsync: mutateAsync,
    ...mutateProps,
  };
};
