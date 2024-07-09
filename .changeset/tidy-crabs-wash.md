---
"@fuel-connectors/burner-wallet-connector": minor
"@fuel-connectors/walletconnect-connector": minor
"@fuel-connectors/evm-connector": minor
"@fuel-connectors/fuel-wallet": minor
---

Breaking Change: now methods that return address, like "getAccount", will return a b256 address instead of a bech32.
