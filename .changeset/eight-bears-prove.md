---
"@fuel-connectors/walletconnect-connector": patch
---

Wallet Connect Connector will inherently return a predicate address, instead of the actual account, due to the bridge it does between networks.
Added a method to retrieve the actual account address that originated the predicate, allowing validation of whether a predicate originated from a specific EVM address.

