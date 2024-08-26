# useWallet
---

A hook to fetch and manage a wallet by its address in the connected app.

#### Returns

An object containing:
- `wallet`: The wallet or `null` if the wallet could not be fetched or the address is invalid.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

#### Params

The parameters to fetch a wallet.
- `address`: The wallet address to fetch. If not provided, the current account's address will be used.

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

[packages/react/src/hooks/useWallet.ts:28](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useWallet.ts#L28)
