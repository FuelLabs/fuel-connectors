---
"@fuel-connectors/social-connector": minor
"@fuels/connectors": patch
"@fuels/react": minor
---

feat: Add social login connector via Privy

- Add new `@fuel-connectors/social-connector` package for social authentication (Google/Email) via Privy
- Extends `PredicateConnector` from `bako-predicate-connector` to leverage Bako Safe integration
- Export `SocialConnector` and types from `@fuels/connectors` bundle
- Move Privy provider configuration to `@fuels/react` package with `PrivyInternalProvider` and `PrivyEventsWatcher` utilities
- Add Privy as a peer dependency in `@fuels/react`
