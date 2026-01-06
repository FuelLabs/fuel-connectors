---
"@fuel-connectors/social-connector": minor
"@fuels/connectors": patch
---

feat: Add social login connector via Privy

- Add new `@fuel-connectors/social-connector` package for social authentication (Google/Email) via Privy
- Extends `PredicateConnector` from `bako-predicate-connector` to leverage Bako Safe integration
- Add `privyAuth` parameter to `defaultConnectors()` function
- Export `SocialConnector` and types from `@fuels/connectors` bundle
