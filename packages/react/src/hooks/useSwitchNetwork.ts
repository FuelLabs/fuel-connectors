import { useMutation } from '@tanstack/react-query';
import type { Network } from 'fuels';
import { useFuel } from '../providers';

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to switch to the provided network in the connected app.
 * The hook checks if the provided network exists.
 * If it doesn’t, it adds the network.
 * Otherwise, it simply selects the existing network.
 *
 * @returns {object} An object containing:
 * - `switchNetwork`: function to add a network synchronously.
 * - `switchNetworkAsync` function to add a network asynchronously.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useMutation | `...mutationProps`}: Destructured properties from `useMutation` result.
 *
 * @examples
 *  To switch to a network synchronously:
 * ```ts
 * const { switchNetwork } = useSwitchNetwork();
 * switchNetwork(network);
 * ```
 *
 * To switch to a network asynchronously:
 * ```ts
 * const { switchNetworkAsync } = useSwitchNetwork();
 * await switchNetworkAsync(network);
 * ```
 *
 */
export const useSwitchNetwork = () => {
  const { fuel } = useFuel();

  const { mutate, mutateAsync, ...queryProps } = useMutation({
    mutationFn: async (input: Network) => {
      try {
        const result = await fuel.selectNetwork(input);
        return result;
      } catch {
        const result = await fuel.addNetwork(input.url);
        return result;
      }
    },
  });

  return {
    switchNetwork: mutate,
    switchNetworkAsync: mutateAsync,
    ...queryProps,
  };
};
