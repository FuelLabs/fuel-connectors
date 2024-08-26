# useAccounts
---

A hook to get the accounts of the user in the connected app.

#### Returns

An object containing:
- `accounts`: User accounts.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

#### Examples

```ts
const { accounts } = useAccounts();
console.log(accounts);
```

#### Defined in

[packages/react/src/hooks/useAccounts.ts:19](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useAccounts.ts#L19)

___
