# @fuels/react

## 0.23.0

### Minor Changes

- 🐞 Fixing infinite loading of wallet connector when fuelConfig connectors are defined asynchronously, by [@rodrigobranas](https://github.com/rodrigobranas) (See [#108](https://github.com/FuelLabs/fuels-npm-packs/pull/108))

### Patch Changes

- Updated UI connector's style to match provider's modal style, increasing user experience, by [@LeoCourbassier](https://github.com/LeoCourbassier) (See [#110](https://github.com/FuelLabs/fuels-npm-packs/pull/110))

## 0.22.0

### Minor Changes

- Add a loading state to display when the connector has installed status set to false, by [@helciofranco](https://github.com/helciofranco) (See [#104](https://github.com/FuelLabs/fuels-npm-packs/pull/104))

## 0.21.0

### Minor Changes

- Created useContractRead hook to read contract data from a contract instance or from a contract id.
  If provided Abi is declared with `as const`, hook will dynamically infer possible method names, as well as the arguments quantity and types for a selected method, by [@arthurgeron](https://github.com/arthurgeron) (See [#91](https://github.com/FuelLabs/fuels-npm-packs/pull/91))
- - Add `useTransactionResult` hook to get a transaction that has been executed
  - Create a type `UseNamedQueryParams` to allow overriding `select` function of TanStack Query and our custom `name` property.
  ### Basic usage with `select` function
  ````tsx
  const { receipts } = useTransactionResult({
  txId: '0xd7ad974cdccac8b41132dfe1d2a4219a681af1865f0775f141c4d6201ee428d1',
  query: {
  name: 'receipts', // Or anything else (optional, default: 'transactionResult')
  select: (data) => data?.receipts || null,
  },
  });
  ```, by [@helciofranco](https://github.com/helciofranco) (See [#94](https://github.com/FuelLabs/fuels-npm-packs/pull/94))
  ````
- Adds mutation callbacks, such as `onError` and `onSuccess`, by [@helciofranco](https://github.com/helciofranco) (See [#97](https://github.com/FuelLabs/fuels-npm-packs/pull/97))
- Provide consistent return types across Fuel hooks, for an easier typed experience.
  Every query hook will now return a `null` value if the query is not available, instead of `undefined`.
  ### Examples
  ````tsx
  const { wallet } = useWallet(); // wallet is Wallet | null
  const { network } = useNetwork(); // network is Network | null
  // and so on... Every query hook will return T | null
  ```, by [@helciofranco](https://github.com/helciofranco) (See [#85](https://github.com/FuelLabs/fuels-npm-packs/pull/85))
  ````
- Add `useSendTransaction` hook that allows developers to easily send a transaction.
  ````tsx
  const { sendTransaction } = useSendTransaction();
  // [...]
  const transactionRequest = new ScriptTransactionRequest({}); // Or any other tx request
  sendTransaction({
  address: 'fuel1zs7l8ajg0qgrak3jhhmq3xf3thd8stu535gj7p5fye2578yccjyqcgja3z',
  transaction,
  });
  ```, by [@helciofranco](https://github.com/helciofranco) (See [#92](https://github.com/FuelLabs/fuels-npm-packs/pull/92))
  ````

## 0.20.0

### Minor Changes

- Update fuels dependency to 0.86.0, by [@LuizAsFight](https://github.com/LuizAsFight) (See [#80](https://github.com/FuelLabs/fuels-npm-packs/pull/80))

## 0.19.0

### Minor Changes

- Upgrade to testnet (fuel-core 0.26.0 + fuels-ts 0.84.0), by [@arthurgeron](https://github.com/arthurgeron) (See [#72](https://github.com/FuelLabs/fuels-npm-packs/pull/72))
- Upgraded fuels-ts to new minor 0.83.0, by [@arthurgeron](https://github.com/arthurgeron) (See [#72](https://github.com/FuelLabs/fuels-npm-packs/pull/72))

## 0.18.1

### Patch Changes

- 🐞 fix: UI connectors loader, by [@luizstacio](https://github.com/luizstacio) (See [#68](https://github.com/FuelLabs/fuels-npm-packs/pull/68))

## 0.18.0

### Minor Changes

- 🐞 fix: only set theme colors style when its on client, by [@LuizAsFight](https://github.com/LuizAsFight) (See [#63](https://github.com/FuelLabs/fuels-npm-packs/pull/63))

## 0.17.0

### Minor Changes

- ✨ feat: make react-query package a peerDependency, by [@LuizAsFight](https://github.com/LuizAsFight) (See [#60](https://github.com/FuelLabs/fuels-npm-packs/pull/60))

### Patch Changes

- 🐞 fix: listen to prop data also using Reflect, by [@LuizAsFight](https://github.com/LuizAsFight) (See [#58](https://github.com/FuelLabs/fuels-npm-packs/pull/58))

## 0.16.0

### Minor Changes

- 🐞 fix: fuel hooks will only re-render tracked properties, instead of listening to every useQuery property, by [@helciofranco](https://github.com/helciofranco) (See [#55](https://github.com/FuelLabs/fuels-npm-packs/pull/55))

## 0.15.3

## 0.15.2

### Patch Changes

- chore: update fuels deps, by [@luizstacio](https://github.com/luizstacio) (See [#50](https://github.com/FuelLabs/fuels-npm-packs/pull/50))

## 0.15.1

### Patch Changes

- Migrate packages from fuels wallet to this repo, by [@matt-user](https://github.com/matt-user) (See [#40](https://github.com/FuelLabs/fuels-npm-packs/pull/40))

## 0.15.1

### Patch Changes

- Migrate packages from fuels wallet to this repo, by [@matt-user](https://github.com/matt-user) (See [#40](https://github.com/FuelLabs/fuels-npm-packs/pull/40))
