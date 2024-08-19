import { useMutation } from '@tanstack/react-query';

import { useFuel } from '../providers';
import { MUTATION_KEYS } from '../utils';

/**
 * `useAddNetwork` is a React Hook to add a network.
 * The accounts is fetched using the connected connector's `addNetwork` method.
 *
 * @returns {object} An object containing:
 * - `addNetwork`: function to add a network synchronously
 * - `addNetworkAsync` function to add a network asynchronously.
 * - Additional properties from `useMutation`.
 *
 * @see {@link https://github.com/FuelLabs/fuels-ts/blob/master/packages/account/src/connectors/fuel-connector.ts | fuel-connector.ts on `FuelLabs/fuel-ts`}
 *
 * @example To add a network synchronously:
 * ```ts
 * const { addNetwork } = useAddNetwork();
 * addNetwork(network);
 * ```
 *
 * @example To add a network asynchronously:
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
