import { PrivyProvider } from '@privy-io/react-auth';
import type { PropsWithChildren } from 'react';
import { Suspense } from 'react';
import type { PrivyConfig } from '../types';

type PrivyInternalProviderProps = PropsWithChildren & PrivyConfig;

/**
 * Internal provider that wraps Privy's PrivyProvider with lazy loading.
 * This is not exported - users should use FuelProvider with socialLogin prop instead.
 *
 * Note: This component eliminates the intermediate PrivyHooksProvider layer.
 * Components can now use Privy hooks (usePrivy, useWallets, etc.) directly.
 */
export function PrivyInternalProvider({
  appId,
  config,
  children,
}: PrivyInternalProviderProps) {
  return (
    <Suspense fallback={<PrivyFallback />}>
      <PrivyProvider appId={appId} config={config}>
        {children}
      </PrivyProvider>
    </Suspense>
  );
}

/**
 * Fallback component shown while Privy is loading
 */
function PrivyFallback() {
  return (
    <div style={{ display: 'contents' }}>
      {/* display: contents makes this invisible but keeps children in DOM */}
    </div>
  );
}
