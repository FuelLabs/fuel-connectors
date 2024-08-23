# useSendTransaction
---

A hook to send transactions in the connected app.

#### Returns

Methods to send transactions.
- `sendTransaction`: function to send a transaction synchronously.
- `sendTransactionAsync`: function to send a transaction asynchronously.
- [Properties of `@tanstack/react-query`, `useMutation` method](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation).

**`Params`**

params The parameters to send a transaction.

**`Example`**

```ts
const { sendTransaction } = useSendTransaction();
sendTransaction({ address: '0x...', transaction: {...} });
```

**`Example`**

```ts
const { sendTransactionAsync } = useSendTransaction();
await sendTransactionAsync({ address: '0x...', transaction: {...} });
```

#### Defined in

[packages/react/src/hooks/useSendTransaction.ts:43](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useSendTransaction.ts#L43)

___
