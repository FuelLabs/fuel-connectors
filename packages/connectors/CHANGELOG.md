# @fuels/connectors

## 0.29.1

## 0.29.0

### Minor Changes

- [#296](https://github.com/FuelLabs/fuel-connectors/pull/296) [`3c29c36`](https://github.com/FuelLabs/fuel-connectors/commit/3c29c368ced7dd17a7768b048c576ec1c6392472) Thanks [@LeoCourbassier](https://github.com/LeoCourbassier)! - Allows predicated connectors to receive a providerUrl to configure their providers

### Patch Changes

- [#282](https://github.com/FuelLabs/fuel-connectors/pull/282) [`50488ae`](https://github.com/FuelLabs/fuel-connectors/commit/50488ae7ab7c41202fa48234ef977978a752d992) Thanks [@arthurgeron](https://github.com/arthurgeron)! - Burner is now only included in default connectors on dev mode.

## 0.28.1

## 0.28.0

### Minor Changes

- [#252](https://github.com/FuelLabs/fuel-connectors/pull/252) [`eea98c9`](https://github.com/FuelLabs/fuel-connectors/commit/eea98c991ed9aca318f65743f2734d5aa32e2e0e) Thanks [@helciofranco](https://github.com/helciofranco)! - Update SDK to `0.94.6` version. https://github.com/FuelLabs/fuels-ts/releases/tag/v0.94.6

- [#224](https://github.com/FuelLabs/fuel-connectors/pull/224) [`1f6ee86`](https://github.com/FuelLabs/fuel-connectors/commit/1f6ee8679994528ae36faec51535a183d582a58b) Thanks [@helciofranco](https://github.com/helciofranco)! - Bump pnpm version to v9.5.0

## 0.27.1

## 0.27.0

### Minor Changes

- [#231](https://github.com/FuelLabs/fuel-connectors/pull/231) [`083bf92`](https://github.com/FuelLabs/fuel-connectors/commit/083bf92b594c7d1eee9e7225f909e1e140aef809) Thanks [@helciofranco](https://github.com/helciofranco)! - Update to `fuel-core@0.35.0`, `forc@0.63.3` and `fuels@0.94.4`

## 0.26.0

### Minor Changes

- [#208](https://github.com/FuelLabs/fuel-connectors/pull/208) [`2c194a4`](https://github.com/FuelLabs/fuel-connectors/commit/2c194a46f144c82a0f9a3205d79ef58f938eb297) Thanks [@arthurgeron](https://github.com/arthurgeron)! - Updated wagmi to 12.12.7 alongside core and connectors

## 0.25.0

## 0.24.0

### Minor Changes

- [#167](https://github.com/FuelLabs/fuel-connectors/pull/167) [`ed5fb44`](https://github.com/FuelLabs/fuel-connectors/commit/ed5fb440b1b0739fbeb616156864d9ba6da3ac07) Thanks [@LeoCourbassier](https://github.com/LeoCourbassier)! - - Bumped packages version from `0.9.0` to `0.23.0` following react package's version

  - Updated react-next example to use `defaultConnectors` from @fuels/connectors package

- [#178](https://github.com/FuelLabs/fuel-connectors/pull/178) [`98df6e3`](https://github.com/FuelLabs/fuel-connectors/commit/98df6e304f67a8aa6f43eec9194d179ebfd42725) Thanks [@helciofranco](https://github.com/helciofranco)! - Export BurnerWalletConfig type to use with Burner Wallet Connector

### Patch Changes

- [#173](https://github.com/FuelLabs/fuel-connectors/pull/173) [`f0739c4`](https://github.com/FuelLabs/fuel-connectors/commit/f0739c44b11c1a2e1662120c5ed2480e671c5571) Thanks [@LuizAsFight](https://github.com/LuizAsFight)! - update fuels to 0.93.0

## 0.9.1

### Patch Changes

- [#164](https://github.com/FuelLabs/fuel-connectors/pull/164) [`4bdfc4c`](https://github.com/FuelLabs/fuel-connectors/commit/4bdfc4cb3e32c52ca1376e800a7287a8ebac0812) Thanks [@arthurgeron](https://github.com/arthurgeron)! -

## 0.9.0

### Minor Changes

- [#158](https://github.com/FuelLabs/fuel-connectors/pull/158) [`23afa71`](https://github.com/FuelLabs/fuel-connectors/commit/23afa71b01b799aa320ad56abbb8c2c896a5a156) Thanks [@LuizAsFight](https://github.com/LuizAsFight)! - feat: update to fuels 0.92.0

### Patch Changes

- [#159](https://github.com/FuelLabs/fuel-connectors/pull/159) [`c9a306d`](https://github.com/FuelLabs/fuel-connectors/commit/c9a306d75408f6ba4aa24a9268f595f5349cc64c) Thanks [@LuizAsFight](https://github.com/LuizAsFight)! - Accept `ethWagmiConfig` for eth wallet wagmi configs

- [#156](https://github.com/FuelLabs/fuel-connectors/pull/156) [`481b5fe`](https://github.com/FuelLabs/fuel-connectors/commit/481b5fea5363f38daf0c054712395cfc7e2227e0) Thanks [@arthurgeron](https://github.com/arthurgeron)! - - [Add support for burner wallet config on default connectors](https://github.com/FuelLabs/fuel-connectors/commit/fb845c0cfdfccfda60637af8d405964e9efbdecb)

  - [Burner wallet storage not working on nodejs](https://github.com/FuelLabs/fuel-connectors/commit/bbf19a2f8b6faeafc5c99055fe2ce2beb2988400)
  - [Create in memory storage on burner wallet](https://github.com/FuelLabs/fuel-connectors/commit/242b24f84f4ac35dba9c1332cb46c80bac5f4766)

  Observation: Burner Wallet's Storage will not persist information between executions on Vercel or Node.js env.

## 0.8.1

## 0.8.0

### Minor Changes

- [#126](https://github.com/FuelLabs/fuel-connectors/pull/126) [`f3e7c4b`](https://github.com/FuelLabs/fuel-connectors/commit/f3e7c4ba68e6fd5f2e9cba8599e234ac145ce4ca) Thanks [@guimroque](https://github.com/guimroque)! - add bako safe connector to the default connectors

## 0.7.0

## 0.6.0

### Minor Changes

- [#105](https://github.com/FuelLabs/fuel-connectors/pull/105) [`e3c1b65`](https://github.com/FuelLabs/fuel-connectors/commit/e3c1b653a8830ea70e5e9875e6acc4e269980c0a) Thanks [@LuizAsFight](https://github.com/LuizAsFight)! - Include WalletConnect to defaultConnectors

## 0.5.1

## 0.5.0

### Minor Changes

- [#85](https://github.com/FuelLabs/fuel-connectors/pull/85) [`450ce37`](https://github.com/FuelLabs/fuel-connectors/commit/450ce37769592e611eaddd6af38b0030dc57cdb3) Thanks [@luizstacio](https://github.com/luizstacio)! - Update to fuels 0.88.1

## 0.4.0

### Minor Changes

- [#73](https://github.com/FuelLabs/fuel-connectors/pull/73) [`6fb5d3f`](https://github.com/FuelLabs/fuel-connectors/commit/6fb5d3f5baf0a35fd179c049a0cb112c04139e20) Thanks [@helciofranco](https://github.com/helciofranco)! - fix: bundle only browser-compatible connectors in the main bundle

- [#66](https://github.com/FuelLabs/fuel-connectors/pull/66) [`0c95324`](https://github.com/FuelLabs/fuel-connectors/commit/0c9532431278cdecb8642d0fc2d4add65dcf482c) Thanks [@luizstacio](https://github.com/luizstacio)! - fix: add missing dependencies to allow nextjs to build

## 0.3.0

### Minor Changes

- [#49](https://github.com/FuelLabs/fuel-connectors/pull/49) [`fe8fe45`](https://github.com/FuelLabs/fuel-connectors/commit/fe8fe45ee5b582d1379a9d61a2690a708ceaf69c) Thanks [@pedropereiradev](https://github.com/pedropereiradev)! - burner wallet connector implemented

- [#68](https://github.com/FuelLabs/fuel-connectors/pull/68) [`98c6b5d`](https://github.com/FuelLabs/fuel-connectors/commit/98c6b5d366128d763d601896a7b3b7d594ea6886) Thanks [@arthurgeron](https://github.com/arthurgeron)! - Upgrade fuels and fuel-ts dependencies to 0.83

### Patch Changes

- [#61](https://github.com/FuelLabs/fuel-connectors/pull/61) [`f56bd40`](https://github.com/FuelLabs/fuel-connectors/commit/f56bd40203d8ed3eac70086b773260cd2adc1bdb) Thanks [@luizstacio](https://github.com/luizstacio)! - rename connector name and implement all methods

## 0.2.2

## 0.2.1

### Patch Changes

- [#44](https://github.com/FuelLabs/fuel-connectors/pull/44) [`3263829`](https://github.com/FuelLabs/fuel-connectors/commit/32638296d83b56d4aa725082bdb120d536aa1044) Thanks [@luizstacio](https://github.com/luizstacio)! - fix build for browser

## 0.2.0

### Minor Changes

- [#28](https://github.com/FuelLabs/fuel-connectors/pull/28) [`50cbc26`](https://github.com/FuelLabs/fuel-connectors/commit/50cbc266df3b4d4c74643302960ff5d58d00a91c) Thanks [@pedropereiradev](https://github.com/pedropereiradev)! - feat: Add EVM Connector

- [#28](https://github.com/FuelLabs/fuel-connectors/pull/28) [`50cbc26`](https://github.com/FuelLabs/fuel-connectors/commit/50cbc266df3b4d4c74643302960ff5d58d00a91c) Thanks [@pedropereiradev](https://github.com/pedropereiradev)! - refactor evm connector

### Patch Changes

- [#22](https://github.com/FuelLabs/fuel-connectors/pull/22) [`332976e`](https://github.com/FuelLabs/fuel-connectors/commit/332976ef690f8fc1d20879c493496e2f57185cb7) Thanks [@fuel-service-user](https://github.com/fuel-service-user)! - ci: update to tag latest

- [#19](https://github.com/FuelLabs/fuel-connectors/pull/19) [`e75249b`](https://github.com/FuelLabs/fuel-connectors/commit/e75249b61a8c3c2e57dcea9e7c3ca9951081b47b) Thanks [@helciofranco](https://github.com/helciofranco)! - ci: remove redundant packages from the umbrella `@fuels/connectors` package

- [#23](https://github.com/FuelLabs/fuel-connectors/pull/23) [`adf2fa0`](https://github.com/FuelLabs/fuel-connectors/commit/adf2fa0c9116b4b7a57755d455dc3c544cd72d98) Thanks [@fuel-service-user](https://github.com/fuel-service-user)! - ci: update to tag latest

- [#19](https://github.com/FuelLabs/fuel-connectors/pull/19) [`e75249b`](https://github.com/FuelLabs/fuel-connectors/commit/e75249b61a8c3c2e57dcea9e7c3ca9951081b47b) Thanks [@helciofranco](https://github.com/helciofranco)! - chore: update fuels to latest version (0.78.0)

- [#31](https://github.com/FuelLabs/fuel-connectors/pull/31) [`42d1054`](https://github.com/FuelLabs/fuel-connectors/commit/42d105443759ff6665dd4dbdaf3d5178b2138176) Thanks [@fuel-service-user](https://github.com/fuel-service-user)! - ci: update to tag latest

## 0.1.1

### Patch Changes

- [#8](https://github.com/FuelLabs/fuel-connectors/pull/8) [`6bd62e3`](https://github.com/FuelLabs/fuel-connectors/commit/6bd62e3bb23a984a7fc6e6f4e09ccb2a14f442b7) Thanks [@luizstacio](https://github.com/luizstacio)! - fix: return type of defaultConnectors

- [#6](https://github.com/FuelLabs/fuel-connectors/pull/6) [`10ff16f`](https://github.com/FuelLabs/fuel-connectors/commit/10ff16fc1698e32bfbc1cf318a523afe77b15b1e) Thanks [@LuizAsFight](https://github.com/LuizAsFight)! - chore: add `pnpm build:watch`

- [#11](https://github.com/FuelLabs/fuel-connectors/pull/11) [`b037bb9`](https://github.com/FuelLabs/fuel-connectors/commit/b037bb9fe07ae4a4da405b08336153afab2a1503) Thanks [@helciofranco](https://github.com/helciofranco)! - feat: upgrade `fuels` packages to 0.77.0

## 0.1.0

### Minor Changes

- [#4](https://github.com/FuelLabs/fuel-connectors/pull/4) [`ee7209a`](https://github.com/FuelLabs/fuel-connectors/commit/ee7209a0843e21e85adf8c0f364301e0dbda140e) Thanks [@luizstacio](https://github.com/luizstacio)! - Initial connectors release with Fuel, Fuel Development and Fuelet connectors

## 0.1.0

### Minor Changes

- [#4](https://github.com/FuelLabs/fuel-connectors/pull/4) [`ee7209a`](https://github.com/FuelLabs/fuel-connectors/commit/ee7209a0843e21e85adf8c0f364301e0dbda140e) Thanks [@luizstacio](https://github.com/luizstacio)! - Initial connectors release with Fuel, Fuel Development and Fuelet connectors
