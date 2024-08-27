# useTransactionResult
---

A hook to fetch the result of a specific transaction in the connected app.

#### Params

Parameters to configure the hook.
- `txId`: A string value representing the transaction ID.
- `query`: Additional query parameters to customize the behavior of `useNamedQuery`.

#### Returns

An object containing
- `transactionResult`: The result of the transaction or `null`.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

To fetch the result of a transaction:
```ts
const { transactionResult } = useTransactionResult({
  txId: '0x...',
});
console.log(transactionResult);
```

#### Defined in

[packages/react/src/hooks/useTransactionResult.ts:52](https://github.com/LeoCourbassier/fuel-connectors/blob/f33236b78c83c4d8956637865372a08961d56b69/packages/react/src/hooks/useTransactionResult.ts#L52)

___
