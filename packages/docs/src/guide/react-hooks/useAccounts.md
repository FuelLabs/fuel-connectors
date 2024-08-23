# useAccounts
---

A hook to get the accounts of the user in the connected app.

#### Returns

An object containing:
- `accounts`: User accounts.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

**`Example`**

```ts
const { accounts } = useAccounts();
console.log(accounts);
```

#### Defined in

[packages/react/src/hooks/useAccounts.ts:19](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useAccounts.ts#L19)

___
