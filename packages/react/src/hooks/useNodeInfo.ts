import { compare } from 'compare-versions';

import { useNamedQuery } from '../core';
import { QUERY_KEYS } from '../utils';

import { useProvider } from './useProvider';

type NodeInfoParams = {
  /**
   * The minimum version of the node that is considered compatible.
   * Defaults to '0.0.0' if not provided.
   */
  version?: string;
};

/**
 * `useNodeInfo` is a React Hook to fetch node information from the provider and check compatibility.
 * This hook retrieves information about the node associated with the current provider.
 *
 * @param {object} [params={}] - Parameters to configure the hook.
 * @param {string} [params.version='0.0.0'] - The minimum version of the node that is considered compatible.
 * @returns {object} An object containing:
 * - `nodeInfo`: The node information data or `null`.
 * - `isCompatible`: Whether the node is compatible with the specified version.
 * - Additional properties from `useNamedQuery`.
 *
 * @example To fetch node information and check compatibility
 * ```ts
 * const { nodeInfo, isCompatible } = useNodeInfo({ version: '1.2.3' });
 * ```
 */
export const useNodeInfo = ({ version = '0.0.0' }: NodeInfoParams = {}) => {
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
    initialData: null,
    enabled: !!provider,
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
