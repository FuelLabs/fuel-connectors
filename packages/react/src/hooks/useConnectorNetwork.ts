import type { FuelConnector } from 'fuels';
import { useNamedQuery } from '../core';
import { QUERY_KEYS } from '../utils';

type UseConnectorNetworkParams = {
  /**
   * The connector to fetch the network for.
   */
  connector: FuelConnector | undefined;
};

/**
 * A hook to fetch the current network of a specific connector.
 *
 * @params {connector} The Fuel connector for which to fetch the network.
 *
 * @returns {object} An object containing:
 * - `network`: The current network of the connector.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 * To fetch the current network of a connector:
 * ```ts
 * const { network } = useConnectorNetwork({ connector });
 * console.log(network);
 * ```
 */
export const useConnectorNetwork = ({
  connector,
}: UseConnectorNetworkParams) => {
  return useNamedQuery('connectorNetwork', {
    queryKey: QUERY_KEYS.connectorNetwork(connector?.name),
    queryFn: async () =>
      connector?.currentNetwork() || Promise.resolve(undefined),
  });
};
