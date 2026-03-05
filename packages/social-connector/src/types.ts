import type { PredicateConfig } from '@fuel-connectors/bako-predicate-connector';
import {
  PrivyAuthEventTypes,
  type TPrivyAuthObserver,
} from '@fuel-connectors/common';
import type {
  ConnectedWallet,
  User,
  useLoginWithEmail,
  usePrivy,
  useSignMessage,
} from '@privy-io/react-auth';
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
 */
export interface PrivyAuthInterface {
  /** Whether the user is authenticated */
  authenticated: boolean;
  /** Whether Privy has finished initializing */
  ready: boolean;
  /** The authenticated user object */
  user?: User;
  /** Login method to trigger Privy authentication modal */
  login: ReturnType<typeof usePrivy>['login'];
  /** Logout method to disconnect the user */
  logout: ReturnType<typeof usePrivy>['logout'];
  /** Sign a message using useSignMessage hook (Privy v2 API) */
  signMessage: ReturnType<typeof useSignMessage>['signMessage'];
  /** Embedded wallet from useWallets() - optional for direct provider access */
  embeddedWallet?: ConnectedWallet;
  /** Send OTP code to email (from useLoginWithEmail hook) */
  sendCode?: ReturnType<typeof useLoginWithEmail>['sendCode'];
  /** Login with OTP code (from useLoginWithEmail hook) */
  loginWithCode?: ReturnType<typeof useLoginWithEmail>['loginWithCode'];
  /** Manually create embedded wallet (from usePrivy hook) */
  createWallet?: ReturnType<typeof usePrivy>['createWallet'];
}

export interface PrivyAuthObserverType extends TPrivyAuthObserver {
  User: User;
  EmbeddedWallet: ConnectedWallet;
  SignMessage: ReturnType<typeof useSignMessage>['signMessage'];
  SendCode: ReturnType<typeof useLoginWithEmail>['sendCode'];
  LoginWithCode: ReturnType<typeof useLoginWithEmail>['loginWithCode'];
  Login: ReturnType<typeof usePrivy>['login'];
  Logout: ReturnType<typeof usePrivy>['logout'];
  CreateWallet: ReturnType<typeof usePrivy>['createWallet'];
}

/**
 * Type for listeners of PrivyAuthObserver events.
 * Each event has a specific type based on the event type.
 *
 * Type Parameters:
 * - T: Object type conforming to TPrivyAuthObserver, containing properties:
 *   - User: The user type (e.g., Privy's User)
 *   - EmbeddedWallet: The embedded wallet type (e.g., Privy's ConnectedWallet)
 *   - SignMessage, SendCode, LoginWithCode, Login, Logout, CreateWallet: Function types
 */
export type ObserverListenersType<
  T extends PrivyAuthObserverType = PrivyAuthObserverType,
> = {
  [PrivyAuthEventTypes.authenticated]?: (value: boolean) => void;
  [PrivyAuthEventTypes.ready]?: (value: boolean) => void;
  [PrivyAuthEventTypes.user]?: (value?: T['User']) => void;
  [PrivyAuthEventTypes.embeddedWallet]?: (value?: T['EmbeddedWallet']) => void;
  [PrivyAuthEventTypes.signMessage]?: (value?: T['SignMessage']) => void;
  [PrivyAuthEventTypes.sendCode]?: (value?: T['SendCode']) => void;
  [PrivyAuthEventTypes.loginWithCode]?: (value?: T['LoginWithCode']) => void;
  [PrivyAuthEventTypes.login]?: (value?: T['Login']) => void;
  [PrivyAuthEventTypes.logout]?: (value?: T['Logout']) => void;
  [PrivyAuthEventTypes.createWallet]?: (value?: T['CreateWallet']) => void;
};
