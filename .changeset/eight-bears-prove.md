---
"@fuel-connectors/walletconnect-connector": patch
---

Wallet Connect Connector will inherently return a predicate address, instead of the actual account, due to the bridge it does between networks.
Added a method to get the actual account address that has originated the predicate, so we can validate if a predicate original from a specific evm address
