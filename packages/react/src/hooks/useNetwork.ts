import { keepPreviousData } from '@tanstack/react-query';
import { FuelConnectorEventTypes, type Network } from 'fuels';
import { useEffect } from 'react';
import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { useFuel } from '../providers';
import { QUERY_KEYS } from '../utils';
import { useIsConnected } from './useIsConnected';

const TIMEOUT = 500;

type UseNetwork = {
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: Omit<
    UseNamedQueryParams<'network', Network | null, Error, Network | null>,
    'queryKey' | 'queryFn' | 'refetchInterval'
  >;
};

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to retrieve the current network information in the connected app.
 *
 * @returns {object} An object containing:
 * - `network`: The network information data.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 *  To get the current network information
 * ```ts
 * const { network } = useNetwork();
 * console.log(network);
 * ```
 */
export const useNetwork = (params?: UseNetwork) => {
  const { fuel } = useFuel();
  const connectedQuery = useIsConnected();
  const isConnected = connectedQuery.isConnected;

  const networkQuery = useNamedQuery('network', {
    queryKey: QUERY_KEYS.currentNetwork(isConnected),
    queryFn: async () => {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject('Time out fetching network'), TIMEOUT),
      );
      const current = await fuel.currentNetwork();
      if (!current && isConnected) {
        throw new Error('Network not found');
      }
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return Promise.race([current, timeout as any]);
    },
    placeholderData: null,
    refetchOnMount: true,
    refetchInterval: (e) => {
      if (!e.state.data || e.state.error) {
        return TIMEOUT;
      }
      return false;
    },
    retry: (attempts) => {
      if (attempts > 10) {
        return false;
      }
      return true;
    },
    enabled: isConnected,
    ...params?.query,
  });

  useEffect(() => {
    const sub = fuel.on(FuelConnectorEventTypes.currentNetwork, () => {
      networkQuery.refetch();
    });
    return () => {
      sub.unsubscribe();
    };
  }, [fuel, networkQuery.refetch]);

  return networkQuery;
};
