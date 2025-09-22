# useWallet
---

A hook to fetch and manage a wallet by its address in the connected app.

#### Params

The parameters to fetch a wallet.
- `address`: The wallet address to fetch. If not provided, the current account's address will be used.

#### Examples

To get a wallet by address:
```ts
const { wallet } = useWallet({ account: '0x...' });
```
To get the current account's wallet:
```ts
const { wallet } = useWallet();
```

#### Deprecated

Use `useWallet({ account })` instead.

#### Defined in
[packages/react/src/hooks/useWallet.ts:54](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useWallet.ts#L54)
