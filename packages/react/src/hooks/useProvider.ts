import type { Provider } from 'fuels';
import { useMemo } from 'react';
import type { UseNamedQueryParams } from '../core';
import { useWallet } from './useWallet';

type UseProviderParams = {
  /**
   * Additional query parameters to customize the behavior of `useNamedQuery`.
   */
  query?: UseNamedQueryParams<
    'provider',
    Provider | null,
    Error,
    Provider | null
  >;
};

// @TODO: Add a link to fuel connector's documentation.
/**
 * @deprecated This hook is deprecated and will be removed in a future version.
 */
/**
 * A hook to retrieve the current provider in the connected app.
 *
 * @returns {object} An object containing:
 * - `provider`: The provider data or `null`.
 * - {@link https://tanstack.com/query/latest/docs/framework/react/reference/useQuery | `...queryProps`}: Destructured properties from `useQuery` result.
 *
 * @examples
 * To get the current provider:
 * ```ts
 * const { provider } = useProvider();
 * ```
 */
export const useProvider = (_params?: UseProviderParams) => {
  const { wallet } = useWallet();

  const provider = useMemo(() => {
    return wallet?.provider;
  }, [wallet?.provider, wallet?.provider.url]);

  return { provider };
};
