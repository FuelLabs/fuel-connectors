// Social login icon (modern email envelope with gradient)
export const SOCIAL_ICON =
  "data:image/svg+xml,%3Csvg width='512' height='512' viewBox='0 0 512 512' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2300D68F'/%3E%3Cstop offset='100%25' stop-color='%2300B4A0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='256' cy='256' r='256' fill='url(%23bg)'/%3E%3Crect x='96' y='160' width='320' height='220' rx='24' fill='white' opacity='0.95'/%3E%3Cpath d='M120 184L256 280L392 184' stroke='%2300D68F' stroke-width='20' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Cpath d='M120 356L200 276' stroke='%2300B4A0' stroke-width='16' stroke-linecap='round'/%3E%3Cpath d='M392 356L312 276' stroke='%2300B4A0' stroke-width='16' stroke-linecap='round'/%3E%3C/svg%3E";

export const HAS_WINDOW = typeof window !== 'undefined';
export const WINDOW = HAS_WINDOW ? window : null;

// Polling intervals (in milliseconds)
export const DEFAULT_POLL_INTERVAL_MS = 200;
export const FAST_POLL_INTERVAL_MS = 100;
export const SLOW_POLL_INTERVAL_MS = 500;

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  /** Timeout for Privy to be ready */
  PRIVY_READY: 10_000 as number,
  /** Timeout for require connection check */
  REQUIRE_CONNECTION: 5_000 as number,
  /** Timeout for embedded wallet to be available */
  WALLET_LOAD: 15_000 as number,
  /** Timeout for wallet creation */
  WALLET_CREATION: 10_000 as number,
  /** Timeout for authentication state to stabilize */
  AUTH_STATE_STABLE: 2_000 as number,
  /** Minimum time to wait before considering auth state stable */
  AUTH_STATE_MIN_STABLE: 500 as number,
  /** Timeout for logout to complete */
  LOGOUT: 5_000 as number,
  /** Timeout for full authentication flow */
  AUTHENTICATION: 60_000 as number,
  /** Delay after logout to allow state cleanup */
  POST_LOGOUT_DELAY: 500 as number,
};
