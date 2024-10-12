import type { FuelConnector } from 'fuels';
import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

type UseCurrentConnectorParams<TName extends string, TData> = {
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<TName, FuelConnector | null, Error, TData>;
};

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to fetch a current Wallet Connector.
 *
 * @params {UseCurrentConnectorParams<TName, TData>} Parameters to configure the hook.
 * - `query`: Additional query parameters to customize the behavior of `useNamedQuery`.
 *
 * @returns {object} An object containing:
 * - `connectors`: The list of available connectors.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 * To fetch current connector:
 * ```ts
 * const { currentConnector } = useCurrentConnector();
 * console.log(currentConnector);
 * ```
 */
export const useCurrentConnector = <
  TName extends string = string,
  TData = FuelConnector | null,
>({
  query,
}: UseCurrentConnectorParams<TName, TData> = {}) => {
  const { fuel } = useFuel();
  return useNamedQuery('currentConnector', {
    queryKey: QUERY_KEYS.currentConnector(),
    queryFn: async () => {
      const isConnected = await fuel.isConnected();
      if (!isConnected) return null;
      return fuel.currentConnector() ?? null;
    },
    placeholderData: null,
    ...query,
  });
};
