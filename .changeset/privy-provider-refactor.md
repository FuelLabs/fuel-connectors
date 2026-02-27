---
"@fuels/react": minor
"@fuel-connectors/common": patch
---

refactor: Move Privy provider to @fuels/react package

- Add `PrivyStack` component for managing Privy app initialization and configuration
- Add `PrivyEventsWatcher` component for monitoring Privy authentication state changes
- Implement `PrivyAuthObserver` for subscribing to Privy login/logout events
- Add Privy type definitions and configuration constants to `@fuels/react`
- Export Privy types from `@fuel-connectors/common`: `PrivyAuthEventTypes` enum and `IPrivyAuthObserver` interface
- Simplify `FuelProvider` to conditionally render Privy providers based on `socialLogin` configuration
- Improve provider hierarchy and separation of concerns
