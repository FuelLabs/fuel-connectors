import { useMutation } from '@tanstack/react-query';

import { useFuel } from '../providers';
import { MUTATION_KEYS } from '../utils';

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to add a network in the connected app.
 *
 * @returns {object} An object containing:
 * - `addNetwork`: function to add a network synchronously.
 * - `addNetworkAsync` function to add a network asynchronously.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useMutation | `...mutationProps`}: Destructured properties from `useMutation` result.
 *
 * @examples
 *  To add a network synchronously:
 * ```ts
 * const { addNetwork } = useAddNetwork();
 * addNetwork(network);
 * ```
 *
 * To add a network asynchronously:
 * ```ts
 * const { addNetworkAsync } = useAddNetwork();
 * await addNetworkAsync(network);
 * ```
 *
 */
export const useAddNetwork = () => {
  const { fuel } = useFuel();

  const { mutate, mutateAsync, ...queryProps } = useMutation({
    mutationKey: [MUTATION_KEYS.addAssets],
    mutationFn: async (networkUrl: string) => {
      return fuel.addNetwork(networkUrl);
    },
  });

  return {
    addNetwork: mutate,
    addNetworkAsync: mutateAsync,
    ...queryProps,
  };
};
