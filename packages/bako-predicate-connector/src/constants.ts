export const BAKO_SERVER_URL = 'https://stg-api.bako.global';
export const SOCKET_URL = 'https://stg-api.bako.global';
export const APP_URL = 'https://stg-safe.bako.global/';

export const STORAGE_KEYS = {
  SESSION_ID: 'session_id',
  CURRENT_ACCOUNT: 'current_account',
  BAKO_PERSONAL_WALLET: 'bako_personal_wallet',
  SELECTED_PREDICATE_KEY: 'fuel_selected_predicate_version',
} as const;

export const HAS_WINDOW = typeof window !== 'undefined';
export const WINDOW = HAS_WINDOW ? window : null;
export const ORIGIN = WINDOW ? WINDOW.location.origin : 'testmode';
