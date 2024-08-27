import { useMutation } from '@tanstack/react-query';

import { useFuel } from '../providers';

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to handle connection to the Fuel network in the connected app.
 *
 * @returns {object} An object containing:
 * - `connect`: A function to trigger the connection to the Fuel network.
 * - `connectAsync`: An async function to trigger the connection and return a promise.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useMutation | `...mutationProps`}: Destructured properties from `useMutation` result.
 *
 * @examples
 * To connect to the Fuel network
 * ```ts
 * const { connect } = useConnect();
 * connect('myConnector');
 * ```
 *
 * @example To connect to the Fuel network asynchronously
 * ```ts
 * const { connectAsync } = useConnect();
 * await connectAsync('myConnector');
 * ```
 *
 */
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
