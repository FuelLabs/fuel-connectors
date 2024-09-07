---
"@fuel-connectors/walletconnect-connector": patch
"@fuel-connectors/solana-connector": patch
"@fuel-connectors/evm-connector": patch
"@fuel-connectors/common": patch
---

Introduce custom `encodeTxId` methods for different predicate versions in Solana due to difference in implementation regarding limitation of 32 bytes on sway method use to sign the old predicates
