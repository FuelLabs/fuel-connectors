import type { Asset, NetworkFuel } from 'fuels';
import { useMemo } from 'react';
import { type UseNamedQueryParams, useNamedQuery } from '../../../core';
import { useChain } from '../../../hooks';
import { QUERY_KEYS } from '../../../utils';

const VERIFIED_ASSETS_URL = 'https://fuel.network/verified-assets.json';

export type ResolvedAsset = Omit<Asset, 'networks'> & NetworkFuel;

type UseVerifiedAssetsParams = {
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<
    'verifiedAssets',
    ResolvedAsset[],
    Error,
    ResolvedAsset[]
  >;
};

/**
 * Fetches the verified assets for the current chain.
 *
 * @param params - Additional query parameters to customize the behavior of `useNamedQuery`.
 * @param params.query - Additional query parameters to customize the behavior of `useNamedQuery`.
 *
 * @example
 * ```tsx
 * const { data: verifiedAssets } = useVerifiedAssets();
 * ```
 *
 * @returns The verified assets for the current chain.
 */
export const useVerifiedAssets = (params?: UseVerifiedAssetsParams) => {
  const { chain } = useChain();
  const chainId = useMemo(
    () => chain?.consensusParameters.chainId.toNumber(),
    [chain],
  );

  return useNamedQuery('verifiedAssets', {
    queryKey: QUERY_KEYS.verifiedAssets(chainId),
    queryFn: async () => {
      const data: Asset[] = await fetch(VERIFIED_ASSETS_URL).then((res) =>
        res.json(),
      );

      return data.reduce((acc, { networks, ...asset }) => {
        const network = networks.find(
          (network) => network.chainId === chainId && network.type === 'fuel',
        ) as NetworkFuel | undefined;
        if (network) {
          acc.push({ ...asset, ...network });
        }
        return acc;
      }, [] as ResolvedAsset[]);
    },
    enabled: chainId !== undefined,
    placeholderData: [],
    ...params?.query,
  });
};
