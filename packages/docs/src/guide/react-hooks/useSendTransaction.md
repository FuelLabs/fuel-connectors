# useSendTransaction
---

A hook to send transactions in the connected app.

#### Params

The parameters to send a transaction.
- `address`: The address to send the transaction to.
- `transaction`: The transaction request object that defines the transaction details.

#### Returns

Methods to send transactions.
- `sendTransaction`: function to send a transaction synchronously.
- `sendTransactionAsync`: function to send a transaction asynchronously.
- [`...mutationProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation): Destructured properties from `useMutation` result.

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

[packages/react/src/hooks/useSendTransaction.ts:47](https://github.com/LeoCourbassier/fuel-connectors/blob/f33236b78c83c4d8956637865372a08961d56b69/packages/react/src/hooks/useSendTransaction.ts#L47)

___
