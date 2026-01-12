// Social login icon (generic user/social icon)
export const SOCIAL_ICON =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9IjI1NiIgY3k9IjIwMCIgcj0iODAiIGZpbGw9IiM2NjY2NjYiLz4KPHBhdGggZD0iTTEyOCA0MzJDMTI4IDM2MS4zMDggMTg1LjMwOCAzMDQgMjU2IDMwNEMzMjYuNjkyIDMwNCAzODQgMzYxLjMwOCAzODQgNDMyIiBzdHJva2U9IiM2NjY2NjYiIHN0cm9rZS13aWR0aD0iNjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K';

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
