# useSendTransaction
---

A hook to send transactions in the connected app.

#### Returns

Methods to send transactions.
- `sendTransaction`: function to send a transaction synchronously.
- `sendTransactionAsync`: function to send a transaction asynchronously.
- [Properties of `@tanstack/react-query`, `useMutation` method](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation).

#### Params

The parameters to send a transaction.
- `address`: The address to send the transaction to.
- `transaction`: The transaction request object that defines the transaction details.

#### Examples

To send a transaction synchronously:
```ts
const { sendTransaction } = useSendTransaction();
sendTransaction({ address: '0x...', transaction: {...} });
```

To send a transaction asynchronously:
```ts
const { sendTransactionAsync } = useSendTransaction();
await sendTransactionAsync({ address: '0x...', transaction: {...} });
```

#### Defined in

[packages/react/src/hooks/useSendTransaction.ts:47](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useSendTransaction.ts#L47)

___
