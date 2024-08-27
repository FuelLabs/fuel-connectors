# @fuel-connectors/walletconnect-connector

## 0.26.0

### Minor Changes

- [#208](https://github.com/FuelLabs/fuel-connectors/pull/208) [`2c194a4`](https://github.com/FuelLabs/fuel-connectors/commit/2c194a46f144c82a0f9a3205d79ef58f938eb297) Thanks [@arthurgeron](https://github.com/arthurgeron)! - Updated wagmi to 12.12.7 alongside core and connectors

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

### Patch Changes

- [#164](https://github.com/FuelLabs/fuel-connectors/pull/164) [`4bdfc4c`](https://github.com/FuelLabs/fuel-connectors/commit/4bdfc4cb3e32c52ca1376e800a7287a8ebac0812) Thanks [@arthurgeron](https://github.com/arthurgeron)! - - Add `currentEvmAccount` method to `WalletConnectConnector`, which will return the current ethereum account connected.
  - Fixed Wallet Connect Web3Modal instances conflicting and replacing Solana's
  - Fixed issue where Wallet Connect's Web3Modal would reference a different Wagmi config instance.
  - WalletConnect connector now recovers the last active connection during initialization
  - Updated wagmi and @wagmi/core to 2.11.3
  - Updated @wagmi/connectors to 5.0.26

## 0.9.0

### Minor Changes

- [#158](https://github.com/FuelLabs/fuel-connectors/pull/158) [`23afa71`](https://github.com/FuelLabs/fuel-connectors/commit/23afa71b01b799aa320ad56abbb8c2c896a5a156) Thanks [@LuizAsFight](https://github.com/LuizAsFight)! - feat: update to fuels 0.92.0

- [#137](https://github.com/FuelLabs/fuel-connectors/pull/137) [`266b450`](https://github.com/FuelLabs/fuel-connectors/commit/266b4509dfe59919396b766277ee49a594c169d9) Thanks [@LeoCourbassier](https://github.com/LeoCourbassier)! - Added Solana Connector using Wallet's Connect web3modal provider.

## 0.8.1

### Patch Changes

- [#138](https://github.com/FuelLabs/fuel-connectors/pull/138) [`fd7eaf2`](https://github.com/FuelLabs/fuel-connectors/commit/fd7eaf204e23d566a1e9287923131431908570e1) Thanks [@mvares](https://github.com/mvares)! - fix: maintain disconnected after refresh

## 0.8.0

### Minor Changes

- [#139](https://github.com/FuelLabs/fuel-connectors/pull/139) [`a6af7f3`](https://github.com/FuelLabs/fuel-connectors/commit/a6af7f3417dddb571f54d80feb231e4ee088d3ec) Thanks [@helciofranco](https://github.com/helciofranco)! - `ping` method should never take more than 1 second.
  Specially when it's the `WalletConnect`, since it doesn't relate to the Fuel network directly.

## 0.7.0

### Minor Changes

- [#129](https://github.com/FuelLabs/fuel-connectors/pull/129) [`204bf27`](https://github.com/FuelLabs/fuel-connectors/commit/204bf2707d78c65f8e4ad0ecafa0a6d01b80a94c) Thanks [@LuizAsFight](https://github.com/LuizAsFight)! - Fix transaction fees in WalletConnectConnector. Now users don't need to force maxFee or gasLimit

## 0.6.0

### Minor Changes

- [#69](https://github.com/FuelLabs/fuel-connectors/pull/69) [`31ee2a5`](https://github.com/FuelLabs/fuel-connectors/commit/31ee2a551100bf9c3113d6397d95ac1b5646f4b3) Thanks [@pedropereiradev](https://github.com/pedropereiradev)! - Predicate versioning for predicate based connectors implemented

## 0.5.1

### Patch Changes

- [#65](https://github.com/FuelLabs/fuel-connectors/pull/65) [`7235ac5`](https://github.com/FuelLabs/fuel-connectors/commit/7235ac59077492f9fd3c34a91c52ae7b42ac6ad9) Thanks [@pedropereiradev](https://github.com/pedropereiradev)! - fix current account tu return bech32 address

## 0.5.0

### Minor Changes

- [#85](https://github.com/FuelLabs/fuel-connectors/pull/85) [`450ce37`](https://github.com/FuelLabs/fuel-connectors/commit/450ce37769592e611eaddd6af38b0030dc57cdb3) Thanks [@luizstacio](https://github.com/luizstacio)! - Update default network to testnet

- [#85](https://github.com/FuelLabs/fuel-connectors/pull/85) [`450ce37`](https://github.com/FuelLabs/fuel-connectors/commit/450ce37769592e611eaddd6af38b0030dc57cdb3) Thanks [@luizstacio](https://github.com/luizstacio)! - Update to fuels 0.88.1

## 0.4.0

## 0.3.0

### Minor Changes

- [#68](https://github.com/FuelLabs/fuel-connectors/pull/68) [`98c6b5d`](https://github.com/FuelLabs/fuel-connectors/commit/98c6b5d366128d763d601896a7b3b7d594ea6886) Thanks [@arthurgeron](https://github.com/arthurgeron)! - Upgrade fuels and fuel-ts dependencies to 0.83

### Patch Changes

- [#61](https://github.com/FuelLabs/fuel-connectors/pull/61) [`f56bd40`](https://github.com/FuelLabs/fuel-connectors/commit/f56bd40203d8ed3eac70086b773260cd2adc1bdb) Thanks [@luizstacio](https://github.com/luizstacio)! - rename connector name and implement all methods

## 0.3.0

### Minor Changes

- [#68](https://github.com/FuelLabs/fuel-connectors/pull/68) [`98c6b5d`](https://github.com/FuelLabs/fuel-connectors/commit/98c6b5d366128d763d601896a7b3b7d594ea6886) Thanks [@arthurgeron](https://github.com/arthurgeron)! - Upgrade fuels and fuel-ts dependencies to 0.83

### Patch Changes

- [#61](https://github.com/FuelLabs/fuel-connectors/pull/61) [`f56bd40`](https://github.com/FuelLabs/fuel-connectors/commit/f56bd40203d8ed3eac70086b773260cd2adc1bdb) Thanks [@luizstacio](https://github.com/luizstacio)! - rename connector name and implement all methods
