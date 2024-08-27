# useWallet
---

A hook to fetch and manage a wallet by its address in the connected app.

#### Params

The parameters to fetch a wallet.
- `address`: The wallet address to fetch. If not provided, the current account's address will be used.

#### Returns

An object containing:
- `wallet`: The wallet or `null` if the wallet could not be fetched or the address is invalid.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

To get a wallet by address:
```ts
const { wallet } = useWallet('0x...');
```
To get the current account's wallet:
```ts
const { wallet } = useWallet();
```

#### Defined in

[packages/react/src/hooks/useWallet.ts:28](https://github.com/LeoCourbassier/fuel-connectors/blob/f33236b78c83c4d8956637865372a08961d56b69/packages/react/src/hooks/useWallet.ts#L28)
