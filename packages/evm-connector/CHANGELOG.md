# @fuel-connectors/evm-connector

## 0.27.1

### Patch Changes

- [#242](https://github.com/FuelLabs/fuel-connectors/pull/242) [`9b6b7d3`](https://github.com/FuelLabs/fuel-connectors/commit/9b6b7d3d271aa68fab01c6d236095cc2537b100e) Thanks [@helciofranco](https://github.com/helciofranco)! - Introduce custom `encodeTxId` methods for different predicate versions in Solana due to difference in implementation regarding limitation of 32 bytes on sway method use to sign the old predicates

## 0.27.0

### Minor Changes

- [#223](https://github.com/FuelLabs/fuel-connectors/pull/223) [`1d90228`](https://github.com/FuelLabs/fuel-connectors/commit/1d90228e5425ab4dc8018f72e09797ef385f2ab6) Thanks [@helciofranco](https://github.com/helciofranco)! - Remove automatic balance transfer between predicates

- [#231](https://github.com/FuelLabs/fuel-connectors/pull/231) [`083bf92`](https://github.com/FuelLabs/fuel-connectors/commit/083bf92b594c7d1eee9e7225f909e1e140aef809) Thanks [@helciofranco](https://github.com/helciofranco)! - Update to `fuel-core@0.35.0`, `forc@0.63.3` and `fuels@0.94.4`

## 0.26.0

## 0.25.0

### Minor Changes

- [#148](https://github.com/FuelLabs/fuel-connectors/pull/148) [`6c313df`](https://github.com/FuelLabs/fuel-connectors/commit/6c313dfcac480a345acbf4d1b7a70168ef07f8d5) Thanks [@LeoCourbassier](https://github.com/LeoCourbassier)! - Added a new package with helper classes/functions for predicated connectors since they share a fair ammount of core logic.

## 0.24.0

### Minor Changes

- [#167](https://github.com/FuelLabs/fuel-connectors/pull/167) [`ed5fb44`](https://github.com/FuelLabs/fuel-connectors/commit/ed5fb440b1b0739fbeb616156864d9ba6da3ac07) Thanks [@LeoCourbassier](https://github.com/LeoCourbassier)! - - Bumped packages version from `0.9.0` to `0.23.0` following react package's version

  - Updated react-next example to use `defaultConnectors` from @fuels/connectors package

- [#145](https://github.com/FuelLabs/fuel-connectors/pull/145) [`533abbf`](https://github.com/FuelLabs/fuel-connectors/commit/533abbfd163ad377faf2239d768a15821f6f5611) Thanks [@rodrigobranas](https://github.com/rodrigobranas)! - Breaking Change: now methods that return address, like "getAccount", will return a b256 address instead of a bech32.

### Patch Changes

- [#173](https://github.com/FuelLabs/fuel-connectors/pull/173) [`f0739c4`](https://github.com/FuelLabs/fuel-connectors/commit/f0739c44b11c1a2e1662120c5ed2480e671c5571) Thanks [@LuizAsFight](https://github.com/LuizAsFight)! - update fuels to 0.93.0

## 0.9.1

## 0.9.0

### Minor Changes

- [#158](https://github.com/FuelLabs/fuel-connectors/pull/158) [`23afa71`](https://github.com/FuelLabs/fuel-connectors/commit/23afa71b01b799aa320ad56abbb8c2c896a5a156) Thanks [@LuizAsFight](https://github.com/LuizAsFight)! - feat: update to fuels 0.92.0

## 0.8.1

## 0.8.0

### Minor Changes

- [#139](https://github.com/FuelLabs/fuel-connectors/pull/139) [`a6af7f3`](https://github.com/FuelLabs/fuel-connectors/commit/a6af7f3417dddb571f54d80feb231e4ee088d3ec) Thanks [@helciofranco](https://github.com/helciofranco)! - Import `FuelConnectorEventType` constant from `fuels` instead of relying on the hard-coded value.

## 0.7.0

### Patch Changes

- [#112](https://github.com/FuelLabs/fuel-connectors/pull/112) [`a87a9a4`](https://github.com/FuelLabs/fuel-connectors/commit/a87a9a4f33b96dc796f66ff80c279a232653d8ac) Thanks [@Torres-ssf](https://github.com/Torres-ssf)! - fix: wrong signature index at `EVMWalletConnector`

## 0.6.0

### Minor Changes

- [#69](https://github.com/FuelLabs/fuel-connectors/pull/69) [`31ee2a5`](https://github.com/FuelLabs/fuel-connectors/commit/31ee2a551100bf9c3113d6397d95ac1b5646f4b3) Thanks [@pedropereiradev](https://github.com/pedropereiradev)! - Predicate versioning for predicate based connectors implemented

## 0.5.1

## 0.5.0

### Minor Changes

- [#85](https://github.com/FuelLabs/fuel-connectors/pull/85) [`450ce37`](https://github.com/FuelLabs/fuel-connectors/commit/450ce37769592e611eaddd6af38b0030dc57cdb3) Thanks [@luizstacio](https://github.com/luizstacio)! - Update default network to testnet

- [#85](https://github.com/FuelLabs/fuel-connectors/pull/85) [`450ce37`](https://github.com/FuelLabs/fuel-connectors/commit/450ce37769592e611eaddd6af38b0030dc57cdb3) Thanks [@luizstacio](https://github.com/luizstacio)! - Update to fuels 0.88.1

## 0.4.0

## 0.3.0

### Minor Changes

- [#68](https://github.com/FuelLabs/fuel-connectors/pull/68) [`98c6b5d`](https://github.com/FuelLabs/fuel-connectors/commit/98c6b5d366128d763d601896a7b3b7d594ea6886) Thanks [@arthurgeron](https://github.com/arthurgeron)! - Upgrade fuels and fuel-ts dependencies to 0.83

## 0.2.2

### Patch Changes

- [#46](https://github.com/FuelLabs/fuel-connectors/pull/46) [`df6ef2c`](https://github.com/FuelLabs/fuel-connectors/commit/df6ef2cefda1669f6e0ded378d093d72ab9dd1cc) Thanks [@luizstacio](https://github.com/luizstacio)! - fix: zero witnessIndex for predicate inputs

## 0.2.1

## 0.2.0

### Minor Changes

- [#28](https://github.com/FuelLabs/fuel-connectors/pull/28) [`50cbc26`](https://github.com/FuelLabs/fuel-connectors/commit/50cbc266df3b4d4c74643302960ff5d58d00a91c) Thanks [@pedropereiradev](https://github.com/pedropereiradev)! - feat: Add EVM Connector

- [#28](https://github.com/FuelLabs/fuel-connectors/pull/28) [`50cbc26`](https://github.com/FuelLabs/fuel-connectors/commit/50cbc266df3b4d4c74643302960ff5d58d00a91c) Thanks [@pedropereiradev](https://github.com/pedropereiradev)! - refactor evm connector

### Patch Changes

- [#32](https://github.com/FuelLabs/fuel-connectors/pull/32) [`a7d59c5`](https://github.com/FuelLabs/fuel-connectors/commit/a7d59c5f5cc99297bd2499f7346af4e90be08c5e) Thanks [@pedropereiradev](https://github.com/pedropereiradev)! - fix fuel provider to async

- [#31](https://github.com/FuelLabs/fuel-connectors/pull/31) [`42d1054`](https://github.com/FuelLabs/fuel-connectors/commit/42d105443759ff6665dd4dbdaf3d5178b2138176) Thanks [@fuel-service-user](https://github.com/fuel-service-user)! - ci: update to tag latest

## 0.2.0

### Minor Changes

- [#28](https://github.com/FuelLabs/fuel-connectors/pull/28) [`50cbc26`](https://github.com/FuelLabs/fuel-connectors/commit/50cbc266df3b4d4c74643302960ff5d58d00a91c) Thanks [@pedropereiradev](https://github.com/pedropereiradev)! - feat: Add EVM Connector

- [#28](https://github.com/FuelLabs/fuel-connectors/pull/28) [`50cbc26`](https://github.com/FuelLabs/fuel-connectors/commit/50cbc266df3b4d4c74643302960ff5d58d00a91c) Thanks [@pedropereiradev](https://github.com/pedropereiradev)! - refactor evm connector

### Patch Changes

- [#32](https://github.com/FuelLabs/fuel-connectors/pull/32) [`a7d59c5`](https://github.com/FuelLabs/fuel-connectors/commit/a7d59c5f5cc99297bd2499f7346af4e90be08c5e) Thanks [@pedropereiradev](https://github.com/pedropereiradev)! - fix fuel provider to async

- [#31](https://github.com/FuelLabs/fuel-connectors/pull/31) [`42d1054`](https://github.com/FuelLabs/fuel-connectors/commit/42d105443759ff6665dd4dbdaf3d5178b2138176) Thanks [@fuel-service-user](https://github.com/fuel-service-user)! - ci: update to tag latest
