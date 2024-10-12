import { useMutation } from '@tanstack/react-query';
import { useFuel } from '../providers';

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to add a network in the connected app.
 *
 * @returns {object} An object containing:
 * - `selectNetwork`: function to add a network synchronously.
 * - `selectNetworkAsync` function to add a network asynchronously.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useMutation | `...mutationProps`}: Destructured properties from `useMutation` result.
 *
 * @examples
 *  To select a network synchronously:
 * ```ts
 * const { selectNetwork } = useSelectNetwork();
 * selectNetwork(network);
 * ```
 *
 * To select a network asynchronously:
 * ```ts
 * const { selectNetworkAsync } = useSelectNetwork();
 * await selectNetworkAsync(network);
 * ```
 *
 */
export const useSelectNetwork = () => {
  const { fuel } = useFuel();

  const { mutate, mutateAsync, ...queryProps } = useMutation({
    mutationFn: fuel.selectNetwork,
  });

  return {
    selectNetwork: mutate,
    selectNetworkAsync: mutateAsync,
    ...queryProps,
  };
};
