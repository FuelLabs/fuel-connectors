import { PrivyProvider } from '@privy-io/react-auth';
import type { PrivyClientConfig } from '@privy-io/react-auth';
import type { PropsWithChildren } from 'react';
import { PrivyEventsWatcher } from './PrivyEventsWatcher';

const PRIVY_APP_ID = 'cmdddunbk00njjf0nz6r5r3e9';

const PRIVY_CONFIG: PrivyClientConfig = {
  appearance: {
    theme: 'dark',
  },
  loginMethods: ['email'],
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets',
    },
  },
};

/**
 * Complete Privy integration stack combining PrivyProvider with our custom observer system.
 *
 * This component:
 * 1. Wraps Privy's PrivyProvider for authentication
 * 2. Injects PrivyEventsWatcher to sync Privy state with Fuel connectors
 * 3. Provides a single entry point for Privy dependencies
 *
 * Note: This component is dynamically imported to prevent module-not-found errors
 * for users who don't install @privy-io/react-auth package.
 */
export function PrivyStack({ children }: PropsWithChildren) {
  return (
    <PrivyProvider appId={PRIVY_APP_ID} config={PRIVY_CONFIG}>
      <PrivyEventsWatcher />
      {children}
    </PrivyProvider>
  );
}
