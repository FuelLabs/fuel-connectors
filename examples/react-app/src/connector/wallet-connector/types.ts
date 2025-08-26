import type { Config as WagmiConfig } from '@wagmi/core';
import type {
  ConnectorEvent,
  Provider as FuelProvider,
  StorageAbstract,
} from 'fuels';
import type { PredicateConfig } from './common';

// ============================================================
// WalletConnect configuration types
// ============================================================

/**
 * Configuration options for WalletConnect connector.
 * Extends base connector configuration with WalletConnect-specific options.
 */
export type WalletConnectConfig = {
  /** Fuel network provider instance or promise */
  fuelProvider?: FuelProvider | Promise<FuelProvider>;

  /** WalletConnect project ID for cloud services */
  projectId?: string;

  /** Wagmi configuration object */
  wagmiConfig?: WagmiConfig;

  /** Custom predicate configuration */
  predicateConfig?: PredicateConfig;

  /** Storage implementation for persistence */
  storage?: StorageAbstract;

  /** Chain ID for the network to connect to */
  chainId?: number;

  /** Skip auto-reconnection to prevent session loss on page refresh */
  skipAutoReconnect?: boolean;
};

// ============================================================
// Custom event types
// ============================================================

/**
 * Extended connector event with custom metadata.
 * Provides additional context for connector-specific events.
 */
export interface CustomCurrentConnectorEvent extends ConnectorEvent {
  metadata: {
    /** Indicates if a signature request is pending */
    pendingSignature: boolean;
  };
}
