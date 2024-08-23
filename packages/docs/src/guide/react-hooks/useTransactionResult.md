# useTransactionResult
---

A hook to fetch the result of a specific transaction in the connected app.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `TTransactionType` | extends `TransactionType` | The type of the transaction. |
| `TName` | extends `string` = `string` | The name of the query, defaults to 'transactionResult'. |
| `TData` | ``null`` \| `TransactionResult`\<`TTransactionType`\> | The type of the data returned by the query, defaults to `TransactionResult<TTransactionType> \| null`. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `UseTransactionResultParams`\<`TTransactionType`, `TName`, `TData`\> | Parameters to configure the hook. |

#### Returns

An object containing
- `transactionResult`: The result of the transaction or `null`.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

**`Example`**

```ts
const { transactionResult } = useTransactionResult({
  txId: '0x...',
});
console.log(transactionResult);
```

#### Defined in

[packages/react/src/hooks/useTransactionResult.ts:52](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useTransactionResult.ts#L52)

___
