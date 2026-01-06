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
 * Embedded wallet interface from useWallets() hook
 */
export interface PrivyEmbeddedWallet {
  /** EVM address of the wallet */
  address: string;
  /** Type of wallet client */
  walletClientType: string;
  /** Get EIP1193 provider for the wallet */
  getEthereumProvider: () => Promise<{
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  }>;
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
  /** Sign a message using useSignMessage hook (Privy v2 API) */
  signMessage: (
    params: { message: string },
    options?: { uiOptions?: unknown; address?: string },
  ) => Promise<{ signature: string }>;
  /** Embedded wallet from useWallets() - optional for direct provider access */
  embeddedWallet?: PrivyEmbeddedWallet;
}
