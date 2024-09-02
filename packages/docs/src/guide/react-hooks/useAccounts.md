# useAccounts
---

A hook to get the accounts of the user in the connected app.

#### Returns

An object containing:
- `accounts`: User accounts.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

```ts
const { accounts } = useAccounts();
console.log(accounts);
```

#### Defined in
[packages/react/src/hooks/useAccounts.ts:19](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useAccounts.ts#L19)

___
