import { Provider } from 'fuels';
import type { WalletConnectConfig } from './types';

// ============================================================
// Default configuration values
// ============================================================

/**
 * Default project ID for WalletConnect.
 * This should be replaced with a real project ID in production.
 */
export const DEFAULT_PROJECT_ID = '00000000000000000000000000000000';

// ============================================================
// Icons and assets
// ============================================================

/**
 * Ethereum logo icon as base64 data URL.
 * Used for displaying Ethereum wallet options in the UI.
 */
export const ETHEREUM_ICON =
  'data:image/svg+xml;utf8;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yNTMgMzM1LjEyTDI1NS44ODYgMzM4TDM4OCAyNTkuOTg3TDI1NS44ODYgNDFMMjUzIDUwLjc5ODNWMzM1LjEyWloiIGZpbGw9IiMzNDM0MzQiLz4KPHBhdGggZD0iTTI1NiAzMzhWNDFMMTI0IDI1OS45ODZMMjU2IDMzOFoiIGZpbGw9IiM4QzhDOEMiLz4KPHBhdGggZD0iTTI1NCA0NjUuMjgxTDI1NS42MjggNDcwTDM4OCAyODVMMjU1LjYyOSAzNjIuNTYzTDI1NC4wMDEgMzY0LjUzMkwyNTQgNDY1LjI4MVoiIGZpbGw9IiMzQzNDM0QiLz4KPHBhdGggZD0iTTEyNCAyODVMMjU2IDQ3MFYzNjIuNTYyTDEyNCAyODVaIiBmaWxsPSIjOEM4QzhDIi8+CjxwYXRoIGQ9Ik0yNTYgMjAwVjMzOEwzODggMjU5Ljk4OEwyNTYgMjAwWiIgZmlsbD0iIzE0MTQxNCIvPgo8cGF0aCBkPSJNMjU2IDIwMEwxMjQgMjU5Ljk4OEwyNTYgMzM4VjIwMFoiIGZpbGw9IiMzOTM5MzkiLz4KPC9zdmc+Cg==';

// ============================================================
// Timeout and validation constants
// ============================================================

/**
 * Timeout duration for signature validation requests.
 * Set to 1 minute to allow users sufficient time to sign messages.
 */
export const SIGNATURE_VALIDATION_TIMEOUT = 1000 * 60;

// ============================================================
// Network configuration
// ============================================================

/**
 * Default Fuel network URL for testing.
 * Points to the testnet network by default.
 */
export const DEFAULT_NETWORK_URL = 'https://testnet.fuel.network/v1/graphql';

/**
 * Local development network URL.
 * Used for local development and testing.
 */
export const LOCAL_NETWORK_URL = 'http://127.0.0.1:4000/v1/graphql';

// ============================================================
// Environment detection
// ============================================================

/**
 * Checks if the code is running in a browser environment.
 * Used for conditional logic that depends on browser APIs.
 */
export const HAS_WINDOW = typeof window !== 'undefined';

/**
 * Global window object or empty object if not in browser.
 * Provides safe access to browser APIs.
 */
export const WINDOW = HAS_WINDOW ? window : null;

// ============================================================
// Default configuration objects
// ============================================================

/**
 * Default configuration for WalletConnect connector.
 * Provides sensible defaults that can be overridden.
 */
export const defaultWalletConnectConfig: WalletConnectConfig = {
  projectId: 'e01471314fc69cc4efba6dce12dfd710',
  fuelProvider: new Provider(DEFAULT_NETWORK_URL),
};
