export const BAKO_SERVER_URL = 'https://stg-api.bako.global';
export const SOCKET_URL = 'https://stg-api.bako.global';
export const APP_URL = 'https://stg-safe.bako.global/';

export const STORAGE_PREFIX = 'bako_connector_';

export const STORAGE_KEYS = {
  SESSION_ID: `${STORAGE_PREFIX}session_id`,
  CURRENT_ACCOUNT: `${STORAGE_PREFIX}current_account`,
  BAKO_PERSONAL_WALLET: `${STORAGE_PREFIX}personal_wallet`,
  SELECTED_PREDICATE_KEY: `${STORAGE_PREFIX}selected_predicate_version`,
} as const;

export const HAS_WINDOW = typeof window !== 'undefined';
export const WINDOW = HAS_WINDOW ? window : null;
export const ORIGIN = WINDOW ? WINDOW.location.origin : 'testmode';

export const DEFAULT_CONNECTOR_WALLET_NAME = 'Predicate';
export const DEFAULT_CONNECTOR_WALLET_DESCRIPTION =
  'Auto-created predicate for connector';

export const DEFAULT_VERSION = { app: '0.0.0', network: '0.0.0' } as const;

// Socket configuration
export const SOCKET_CONFIG = {
  /** Enable automatic reconnection */
  RECONNECTION: true,
  /** Number of reconnection attempts before giving up */
  RECONNECTION_ATTEMPTS: 5,
  /** Delay between reconnection attempts (in milliseconds) */
  RECONNECTION_DELAY_MS: 1_000,
} as const;
