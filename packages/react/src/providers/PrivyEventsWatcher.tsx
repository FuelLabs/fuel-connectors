import { useCallback, useEffect, useRef } from 'react';

import {
  type ConnectedWallet,
  type User,
  useLoginWithEmail,
  usePrivy,
  useSignMessage,
  useWallets,
} from '@privy-io/react-auth';

import type { FuelConnector } from 'fuels';
import { useFuel } from './FuelHooksProvider';
import { PrivyAuthObserver } from './PrivyAuthObserver';

/**
 * Synchronizes Privy auth state with connectors via the IPrivyAuthObserver interface.
 *
 * Architecture:
 * 1. Creates a PrivyAuthObserver instance (implements IPrivyAuthObserver<User, ConnectedWallet>)
 * 2. Injects it into connectors that support it (via setPrivyAuthObserver method)
 * 3. Updates observer state when Privy state changes
 * 4. Connectors listen to observer events without depending on React
 */
export function PrivyEventsWatcher() {
  const privy = usePrivy();
  const { wallets } = useWallets();
  const { sendCode, loginWithCode } = useLoginWithEmail();
  const { signMessage } = useSignMessage();
  const { fuel } = useFuel();

  // Observer instance - created once and reused for entire session
  // Typed with concrete Privy User and ConnectedWallet types
  const observerRef = useRef<PrivyAuthObserver<User, ConnectedWallet> | null>(
    null,
  );
  const setupCompleteRef = useRef(false);

  // Find embedded wallet
  const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');

  /**
   * Find a connector that supports the observer pattern.
   */
  const findSocialConnector = useCallback(
    (connectors: FuelConnector[]): FuelConnector | null => {
      if (!Array.isArray(connectors)) return null;

      const connector = connectors.find(
        (connector: unknown) =>
          connector !== null &&
          typeof connector === 'object' &&
          'setPrivyAuthObserver' in connector &&
          'setPrivyAuth' in connector,
      );

      return connector ?? null;
    },
    [],
  );

  /**
   * Build initial Privy auth payload for first injection.
   */
  const buildPrivyAuthPayload = useCallback(() => {
    return {
      authenticated: privy.authenticated,
      ready: privy.ready,
      user: privy.user ?? undefined,
      embeddedWallet,
      signMessage,
      sendCode,
      loginWithCode,
      logout: privy.logout,
      login: privy.login,
      createWallet: privy.createWallet,
    };
  }, [
    privy.authenticated,
    privy.ready,
    privy.user,
    privy.logout,
    privy.login,
    privy.createWallet,
    embeddedWallet,
    signMessage,
    sendCode,
    loginWithCode,
  ]);

  // Effect 1: Initialize observer and inject into connectors once when Privy is ready
  useEffect(() => {
    if (!privy.ready || setupCompleteRef.current) return;

    const initialize = async () => {
      // Create observer instance if not exists
      // Typed with concrete Privy User and ConnectedWallet types
      if (!observerRef.current) {
        observerRef.current = new PrivyAuthObserver<User, ConnectedWallet>();
      }

      // Find connectors that support observer
      const connectors = await fuel.connectors();
      const connector = findSocialConnector(connectors);

      if (connector) {
        // Inject observer with type-safe generic types
        // @ts-expect-error - setPrivyAuthObserver expects IPrivyAuthObserver<User, ConnectedWallet>
        connector.setPrivyAuthObserver(observerRef.current);

        // Also inject initial auth payload for backward compatibility
        // @ts-expect-error - setPrivyAuth accepts PrivyAuthInterface<User, ConnectedWallet>
        connector.setPrivyAuth(buildPrivyAuthPayload());

        setupCompleteRef.current = true;
      }
    };

    initialize();
  }, [privy.ready, fuel, findSocialConnector, buildPrivyAuthPayload]);

  // Effect 2: Update observer state when Privy state changes
  useEffect(() => {
    if (!observerRef.current || !setupCompleteRef.current) return;

    // Emit events only if values changed (smart diffing in observer)
    observerRef.current.setAuthenticated(privy.authenticated);
    observerRef.current.setReady(privy.ready);
    observerRef.current.setUser(privy.user ?? undefined);
    observerRef.current.setEmbeddedWallet(embeddedWallet);
  }, [privy.authenticated, privy.ready, privy.user, embeddedWallet]);

  return null;
}
