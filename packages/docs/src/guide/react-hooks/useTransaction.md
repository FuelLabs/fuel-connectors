# useTransaction
---

A hook to fetch transaction details using a transaction ID.

#### Params

The parameters to fetch the transaction.
- `txId`: A string value representing the transaction ID.

#### Returns

An object containing:
- `transaction`: The transaction details retrieved from the provider, or `null` if not found.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

To fetch transaction details:
```ts
const { transaction, error, isLoading } = useTransaction('0x1234');
```

#### Defined in

[packages/react/src/hooks/useTransaction.ts:26](https://github.com/LeoCourbassier/fuel-connectors/blob/f33236b78c83c4d8956637865372a08961d56b69/packages/react/src/hooks/useTransaction.ts#L26)

___
