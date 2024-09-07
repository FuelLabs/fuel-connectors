---
"@fuel-connectors/walletconnect-connector": patch
"@fuel-connectors/solana-connector": patch
"@fuel-connectors/evm-connector": patch
"@fuel-connectors/common": patch
---

Recently, we updated the `tx_id` in the Solana predicate to use the `full Bytes` format, but this broke compatibility with older predicates. The older ones expect a 32-bytes `tx_id`, not the 64-bytes we're using now.

To fix this and keep everything working with old Solana predicates, we're adding a custom `tx_id` encoder for each version.

The bug was introduced in PR: https://github.com/FuelLabs/fuel-connectors/pull/234