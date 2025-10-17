# useSignTransaction
---

A hook to sign transactions in the connected app without sending them.

#### Params

The parameters to sign a transaction.
- `address`: The address to sign the transaction from.
- `transaction`: The transaction request object that defines the transaction details.
- `params`: Optional parameters for the transaction.

#### Returns

Methods to sign transactions.
- `signTransaction`: function to sign a transaction synchronously.
- `signTransactionAsync`: function to sign a transaction asynchronously.
- [`...mutationProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation): Destructured properties from `useMutation` result.

#### Examples

To sign a transaction synchronously:
```ts
const { signTransaction } = useSignTransaction();
signTransaction({ address: '0x...', transaction: {...}, params: { provider: { url: 'http://...' } } });
```

To sign a transaction asynchronously:
```ts
const { signTransactionAsync } = useSignTransaction();
await signTransactionAsync({ address: '0x...', transaction: {...}, params: { provider: { url: 'http://...' } } });
```

#### Defined in
[packages/react/src/hooks/useSignTransaction.ts:51](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useSignTransaction.ts#L51)

___
