import { useMutation } from '@tanstack/react-query';
import type { FuelConnector } from 'fuels';

/**
 * A hook to select a network in the connector.
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
export const useSelectConnectorNetwork = (
  connector: FuelConnector | undefined | null,
) => {
  const { mutate, mutateAsync, ...queryProps } = useMutation({
    mutationFn: connector?.selectNetwork,
  });

  return {
    selectNetwork: mutate,
    selectNetworkAsync: mutateAsync,
    ...queryProps,
  };
};
