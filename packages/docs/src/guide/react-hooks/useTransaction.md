# useTransaction
---

A hook to fetch transaction details using a transaction ID in the connected app.

#### Returns

An object containing:
- `transaction`: The transaction details retrieved from the provider, or `null` if not found.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

#### Params

The parameters to fetch the transaction.
- `txId`: A string value representing the transaction ID.

#### Examples

To fetch transaction details:
```ts
const { transaction, error, isLoading } = useTransaction('0x1234');
```

#### Defined in

[packages/react/src/hooks/useTransaction.ts:26](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useTransaction.ts#L26)

___
