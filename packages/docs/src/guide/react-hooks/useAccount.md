# useAccount
---

A hook to get the current account of the user in the connected app.

#### Returns

An object containing:
- `account`: The current account of the user.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

**`Example`**

```ts
const { account } = useAccount();
console.log(account);
```

#### Defined in

[packages/react/src/hooks/useAccount.ts:19](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useAccount.ts#L19)

___
