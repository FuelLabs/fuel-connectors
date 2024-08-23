# useTransaction
---

A hook to fetch transaction details using a transaction ID in the connected app.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txId?` | `string` | The ID of the transaction to fetch |

#### Returns

An object containing:
- `transaction`: The transaction details retrieved from the provider, or `null` if not found.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

**`Example`**

```ts
const { transaction, error, isLoading } = useTransaction('0x1234');
```

#### Defined in

[packages/react/src/hooks/useTransaction.ts:24](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useTransaction.ts#L24)

___
