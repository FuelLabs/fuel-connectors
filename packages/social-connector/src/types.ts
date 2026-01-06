import type { PredicateConfig } from '@fuel-connectors/bako-predicate-connector';
import type { Provider as FuelProvider } from 'fuels';

/**
 * Configuration options for the SocialConnector.
 */
export interface SocialConnectorConfig {
  /** Privy authentication interface from usePrivy() hook */
  privyAuth?: PrivyAuthInterface;
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
 */
export interface PrivyAuthInterface {
  /** Whether the user is authenticated */
  authenticated: boolean;
  /** Whether Privy has finished initializing */
  ready: boolean;
  /** The authenticated user object */
  user: {
    /** User's embedded wallet */
    wallet?: {
      /** EVM address of the embedded wallet */
      address: string;
    };
  } | null;
  /** Login method to trigger Privy authentication modal */
  login: (options?: { loginMethods?: string[] }) => Promise<void>;
  /** Logout method to disconnect the user */
  logout: () => Promise<void>;
  /** Sign a message using the embedded wallet */
  signMessage: (
    message: string,
    options?: { uiOptions?: unknown },
  ) => Promise<{ signature: string }>;
}
