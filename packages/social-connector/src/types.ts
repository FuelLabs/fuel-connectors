import type { PredicateConfig } from '@fuel-connectors/bako-predicate-connector';
import { PrivyAuthEventTypes } from '@fuel-connectors/common';
import type { ConnectedWallet, User } from '@privy-io/react-auth';
import type { Provider as FuelProvider } from 'fuels';

/**
 * Configuration options for the SocialConnector.
 */
export interface SocialConnectorConfig {
  /** Fuel provider instance or promise */
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
  /** Custom predicate configuration */
  predicateConfig?: PredicateConfig;
  /** Chain ID for the Fuel network */
  chainId?: number;
}

/**
 * Minimal interface representing the Privy authentication object.
 * This interface matches the shape returned by usePrivy() from @privy-io/react-auth.
 *
 * Type Parameters:
 * - TUser: The user type (e.g., Privy's User)
 * - TEmbeddedWallet: The embedded wallet type (e.g., Privy's ConnectedWallet)
 */
export interface PrivyAuthInterface<
  TUser extends User = User,
  TEmbeddedWallet extends ConnectedWallet = ConnectedWallet,
> {
  /** Whether the user is authenticated */
  authenticated: boolean;
  /** Whether Privy has finished initializing */
  ready: boolean;
  /** The authenticated user object */
  user?: TUser;
  /** Login method to trigger Privy authentication modal */
  login: (options?: { loginMethods?: string[] }) => Promise<void>;
  /** Logout method to disconnect the user */
  logout: () => Promise<void>;
  /** Sign a message using useSignMessage hook (Privy v2 API) */
  signMessage: (
    params: { message: string },
    options?: { uiOptions?: unknown; address?: string },
  ) => Promise<{ signature: string }>;
  /** Embedded wallet from useWallets() - optional for direct provider access */
  embeddedWallet?: TEmbeddedWallet;
  /** Send OTP code to email (from useLoginWithEmail hook) */
  sendCode?: (params: { email: string }) => Promise<void>;
  /** Login with OTP code (from useLoginWithEmail hook) */
  loginWithCode?: (params: { code: string }) => Promise<void>;
  /** Manually create embedded wallet (from usePrivy hook) */
  createWallet?: () => Promise<unknown>;
}

/**
 * Type for listeners of PrivyAuthObserver events.
 * Each event has a specific type based on the event type.
 *
 * Type Parameters:
 * - TUser: The user type (e.g., Privy's User)
 * - TEmbeddedWallet: The embedded wallet type (e.g., Privy's ConnectedWallet)
 */
export type ObserverListenersType<
  TUser extends User = User,
  TEmbeddedWallet extends ConnectedWallet = ConnectedWallet,
> = {
  [PrivyAuthEventTypes.authenticated]?: (value: boolean) => void;
  [PrivyAuthEventTypes.ready]?: (value: boolean) => void;
  [PrivyAuthEventTypes.user]?: (value?: TUser) => void;
  [PrivyAuthEventTypes.embeddedWallet]?: (value?: TEmbeddedWallet) => void;
};
