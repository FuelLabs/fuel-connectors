# useTransactionResult
---

A hook to fetch the result of a specific transaction in the connected app.

#### Returns

An object containing
- `transactionResult`: The result of the transaction or `null`.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

#### Params

Parameters to configure the hook.
- `txId`: A string value representing the transaction ID.
- `query`: Additional query parameters to customize the behavior of `useNamedQuery`.

#### Examples

To fetch the result of a transaction:
```ts
const { transactionResult } = useTransactionResult({
  txId: '0x...',
});
console.log(transactionResult);
```

#### Defined in

[packages/react/src/hooks/useTransactionResult.ts:52](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useTransactionResult.ts#L52)

___
