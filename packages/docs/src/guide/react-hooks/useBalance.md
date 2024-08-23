# useBalance
---

A hook that returns the balance of the user.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `UseBalanceParams` | `UseBalanceParams` | The options to fetch the balance for. |

#### Returns

An object containing:
- `balance`: The balance of the user.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

**`Example`**

```ts
const { balance } = useBalance({address: '0x1234', assetId: '0x1234'});
console.log(balance.format());
```

#### Defined in

[packages/react/src/hooks/useBalance.ts:36](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useBalance.ts#L36)

___
