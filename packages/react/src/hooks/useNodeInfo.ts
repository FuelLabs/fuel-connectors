import { compare } from 'compare-versions';

import { type UseNamedQueryParams, useNamedQuery } from '../core';
import { QUERY_KEYS } from '../utils';

import type { NodeInfo } from 'fuels';
import { useProvider } from './useProvider';

type UseNodeInfoParams = {
  /**
   * The minimum version of the node that is considered compatible.
   * Defaults to '0.0.0' if not provided.
   */
  version?: string;
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<
    'nodeInfo',
    NodeInfo | null,
    Error,
    NodeInfo | null
  >;
};

// @TODO: Add a link to fuel connector's documentation.
/**
 * A hook to fetch node information from the provider and check compatibility.
 *
 * @params {object} The parameters to configure the hook.
 * - `version`: The minimum version of the node that is considered compatible.
 *
 * @returns {object} An object containing:
 * - `nodeInfo`: The node information data or `null`.
 * - `isCompatible`: Whether the node is compatible with the specified version.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 * To fetch node information and check compatibility
 * ```ts
 * const { nodeInfo, isCompatible } = useNodeInfo({ version: '1.2.3' });
 * ```
 */
export const useNodeInfo = ({
  version = '0.0.0',
  query: queryParams,
}: UseNodeInfoParams = {}) => {
  const { provider } = useProvider();

  const query = useNamedQuery('nodeInfo', {
    queryKey: QUERY_KEYS.nodeInfo(provider?.url),
    queryFn: () => {
      try {
        return provider?.fetchNode() || null;
      } catch (_error) {
        return null;
      }
    },
    placeholderData: null,
    enabled: !!provider,
    ...queryParams,
  });

  return new Proxy(query, {
    get(target, prop) {
      if (prop === 'isCompatible') {
        if (target.nodeInfo?.nodeVersion) {
          return compare(target.nodeInfo?.nodeVersion, version, '>=');
        }

        return null;
      }

      return Reflect.get(target, prop);
    },
  }) as typeof query & {
    isCompatible: boolean;
  };
};
