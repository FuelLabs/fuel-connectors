---
"@fuel-connectors/solana-connector": patch
---

Remove legacy Solana predicates due to breaking changes with the `transaction id` format. 
When we updated the `tx_id` in the Solana predicate to use the full `Bytes` representation, we broke the compatibility with the old predicates – since they're expecting the `tx_id` to be a `32-bytes` value, instead of the full 64 ASCII bytes. 

PR that introduced this bug: https://github.com/FuelLabs/fuel-connectors/pull/234