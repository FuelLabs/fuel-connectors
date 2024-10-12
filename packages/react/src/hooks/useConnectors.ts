import type { FuelConnector } from 'fuels';
import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';

type UseConnectorsParams<TName extends string, TData> = {
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<TName, FuelConnector[], Error, TData>;
};

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to fetch a list of connectors in the connected app.
 *
 * @params {UseConnectorsParams<TName, TData>} Parameters to configure the hook.
 * - `query`: Additional query parameters to customize the behavior of `useNamedQuery`.
 *
 * @returns {object} An object containing:
 * - `connectors`: The list of available connectors.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 * To fetch connectors:
 * ```ts
 * const { connectors } = useConnectors();
 * console.log(connectors);
 * ```
 */
export const useConnectors = <
  TName extends string = string,
  TData = FuelConnector[],
>({
  query,
}: UseConnectorsParams<TName, TData> = {}) => {
  const { fuel } = useFuel();

  return useNamedQuery('connectors', {
    queryKey: QUERY_KEYS.connectorList(),
    queryFn: async () => {
      return fuel.connectors();
    },
    placeholderData: [],
    ...query,
  });
};
