import { useMutation } from '@tanstack/react-query';

import { useFuel } from '../providers';

/**
 * `useConnect` is a React Hook to handle connection to the Fuel network.
 * Optionally you can select a connector before connecting.
 *
 * @see {@link https://github.com/FuelLabs/fuels-ts/blob/master/packages/account/src/connectors/fuel-connector.ts | fuel-connector.ts on `FuelLabs/fuel-ts`}
 *
 * @returns {object} object An object containing:
 * - `connect`: A function to trigger the connection to the Fuel network.
 * - `connectAsync`: An async function to trigger the connection and return a promise.
 * - Additional properties from `useMutation`.
 *
 * @example To connect to the Fuel network
 * ```ts
 * const { connect } = useConnect();
 * connect('myConnector');
 * ```
 *
 * @example To connect to the Fuel network asynchronously
 * ```ts
 * const { connectAsync } = useConnect();
 * await connectAsync('myConnector');
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
