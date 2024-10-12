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
[packages/react/src/hooks/useTransaction.ts:26](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useTransaction.ts#L26)

___
