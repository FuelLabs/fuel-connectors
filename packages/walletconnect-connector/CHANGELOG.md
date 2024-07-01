# @fuel-connectors/walletconnect-connector

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
