---
"@fuel-connectors/bako-predicate-connector": minor
"@fuel-connectors/walletconnect-connector": minor
---

feat: Add Bako predicate connector integration for EVM wallets

- Add new `@fuel-connectors/bako-predicate-connector` package that manages predicate versions and communicates with Bako servers
- Update `walletconnect-connector` to extend from the new bako predicate connector
- Enable EVM connector wallets to be accessed through the Bako interface
- Add backward compatibility support for legacy predicates
