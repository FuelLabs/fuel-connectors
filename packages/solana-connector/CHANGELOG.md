# @fuel-connectors/solana-connector

## 0.30.1

## 0.30.0

## 0.29.6

## 0.29.5

### Patch Changes

- [#318](https://github.com/FuelLabs/fuel-connectors/pull/318) [`01f20fb`](https://github.com/FuelLabs/fuel-connectors/commit/01f20fb80e221b5d0daa78743583424c683b382c) Thanks [@luizstacio](https://github.com/luizstacio)! - Call setup provider only on client side

## 0.29.4

## 0.29.3

### Patch Changes

- [#312](https://github.com/FuelLabs/fuel-connectors/pull/312) [`681785b`](https://github.com/FuelLabs/fuel-connectors/commit/681785bdd135ba9a205130bbbc381d32919cf7e3) Thanks [@arthurgeron](https://github.com/arthurgeron)! - Upgrade Fuel SDK to 0.94.8

## 0.29.2

## 0.29.1

## 0.29.0

### Minor Changes

- [#296](https://github.com/FuelLabs/fuel-connectors/pull/296) [`3c29c36`](https://github.com/FuelLabs/fuel-connectors/commit/3c29c368ced7dd17a7768b048c576ec1c6392472) Thanks [@LeoCourbassier](https://github.com/LeoCourbassier)! - Allows predicated connectors to receive a providerUrl to configure their providers

## 0.28.1

## 0.28.0

### Minor Changes

- [#235](https://github.com/FuelLabs/fuel-connectors/pull/235) [`01c65cc`](https://github.com/FuelLabs/fuel-connectors/commit/01c65cc6d75dd677f6fbe5fdb6975af36465a967) Thanks [@helciofranco](https://github.com/helciofranco)! - Add a shared internal package for `EVM predicates` to be used across `Wallet Connect` and `EVM Connector`.

- [#252](https://github.com/FuelLabs/fuel-connectors/pull/252) [`eea98c9`](https://github.com/FuelLabs/fuel-connectors/commit/eea98c991ed9aca318f65743f2734d5aa32e2e0e) Thanks [@helciofranco](https://github.com/helciofranco)! - Update SDK to `0.94.6` version. https://github.com/FuelLabs/fuels-ts/releases/tag/v0.94.6

- [#224](https://github.com/FuelLabs/fuel-connectors/pull/224) [`1f6ee86`](https://github.com/FuelLabs/fuel-connectors/commit/1f6ee8679994528ae36faec51535a183d582a58b) Thanks [@helciofranco](https://github.com/helciofranco)! - Bump pnpm version to v9.5.0

## 0.27.1

### Patch Changes

- [#242](https://github.com/FuelLabs/fuel-connectors/pull/242) [`9b6b7d3`](https://github.com/FuelLabs/fuel-connectors/commit/9b6b7d3d271aa68fab01c6d236095cc2537b100e) Thanks [@helciofranco](https://github.com/helciofranco)! - Introduce custom `encodeTxId` methods for different predicate versions in Solana due to difference in implementation regarding limitation of 32 bytes on sway method use to sign the old predicates

## 0.27.0

### Minor Changes

- [#223](https://github.com/FuelLabs/fuel-connectors/pull/223) [`1d90228`](https://github.com/FuelLabs/fuel-connectors/commit/1d90228e5425ab4dc8018f72e09797ef385f2ab6) Thanks [@helciofranco](https://github.com/helciofranco)! - Remove automatic balance transfer between predicates

- [#231](https://github.com/FuelLabs/fuel-connectors/pull/231) [`083bf92`](https://github.com/FuelLabs/fuel-connectors/commit/083bf92b594c7d1eee9e7225f909e1e140aef809) Thanks [@helciofranco](https://github.com/helciofranco)! - Update to `fuel-core@0.35.0`, `forc@0.63.3` and `fuels@0.94.4`

- [#231](https://github.com/FuelLabs/fuel-connectors/pull/231) [`083bf92`](https://github.com/FuelLabs/fuel-connectors/commit/083bf92b594c7d1eee9e7225f909e1e140aef809) Thanks [@helciofranco](https://github.com/helciofranco)! - Update `Solana Connector` to use the full `Bytes` representation of `tx_id`.

## 0.26.0

## 0.25.0

### Minor Changes

- [#148](https://github.com/FuelLabs/fuel-connectors/pull/148) [`6c313df`](https://github.com/FuelLabs/fuel-connectors/commit/6c313dfcac480a345acbf4d1b7a70168ef07f8d5) Thanks [@LeoCourbassier](https://github.com/LeoCourbassier)! - Added a new package with helper classes/functions for predicated connectors since they share a fair ammount of core logic.

## 0.24.0

### Minor Changes

- [#167](https://github.com/FuelLabs/fuel-connectors/pull/167) [`ed5fb44`](https://github.com/FuelLabs/fuel-connectors/commit/ed5fb440b1b0739fbeb616156864d9ba6da3ac07) Thanks [@LeoCourbassier](https://github.com/LeoCourbassier)! - - Bumped packages version from `0.9.0` to `0.23.0` following react package's version

  - Updated react-next example to use `defaultConnectors` from @fuels/connectors package

- [#179](https://github.com/FuelLabs/fuel-connectors/pull/179) [`d175142`](https://github.com/FuelLabs/fuel-connectors/commit/d175142c7efb3f7134ddef2eae4d318f18bce7ed) Thanks [@helciofranco](https://github.com/helciofranco)! - `Phantom Wallet` is now featured in the Solana wallet connectors list.
  Previously, it required installation or accessing the “All Wallets” list to be found.

### Patch Changes

- [#173](https://github.com/FuelLabs/fuel-connectors/pull/173) [`f0739c4`](https://github.com/FuelLabs/fuel-connectors/commit/f0739c44b11c1a2e1662120c5ed2480e671c5571) Thanks [@LuizAsFight](https://github.com/LuizAsFight)! - update fuels to 0.93.0

## 0.9.1

## 0.9.0

### Minor Changes

- [#158](https://github.com/FuelLabs/fuel-connectors/pull/158) [`23afa71`](https://github.com/FuelLabs/fuel-connectors/commit/23afa71b01b799aa320ad56abbb8c2c896a5a156) Thanks [@LuizAsFight](https://github.com/LuizAsFight)! - feat: update to fuels 0.92.0

- [#137](https://github.com/FuelLabs/fuel-connectors/pull/137) [`266b450`](https://github.com/FuelLabs/fuel-connectors/commit/266b4509dfe59919396b766277ee49a594c169d9) Thanks [@LeoCourbassier](https://github.com/LeoCourbassier)! - Added Solana Connector using Wallet's Connect web3modal provider.

### Patch Changes

- [#159](https://github.com/FuelLabs/fuel-connectors/pull/159) [`c9a306d`](https://github.com/FuelLabs/fuel-connectors/commit/c9a306d75408f6ba4aa24a9268f595f5349cc64c) Thanks [@LuizAsFight](https://github.com/LuizAsFight)! - Include more solana wallets

## 0.9.0

### Minor Changes

- [#158](https://github.com/FuelLabs/fuel-connectors/pull/158) [`23afa71`](https://github.com/FuelLabs/fuel-connectors/commit/23afa71b01b799aa320ad56abbb8c2c896a5a156) Thanks [@LuizAsFight](https://github.com/LuizAsFight)! - feat: update to fuels 0.92.0

- [#137](https://github.com/FuelLabs/fuel-connectors/pull/137) [`266b450`](https://github.com/FuelLabs/fuel-connectors/commit/266b4509dfe59919396b766277ee49a594c169d9) Thanks [@LeoCourbassier](https://github.com/LeoCourbassier)! - Added Solana Connector using Wallet's Connect web3modal provider.

### Patch Changes

- [#159](https://github.com/FuelLabs/fuel-connectors/pull/159) [`c9a306d`](https://github.com/FuelLabs/fuel-connectors/commit/c9a306d75408f6ba4aa24a9268f595f5349cc64c) Thanks [@LuizAsFight](https://github.com/LuizAsFight)! - Include more solana wallets
