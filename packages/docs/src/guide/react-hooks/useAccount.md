# useAccount
---

A hook to get the current account of the user in the connected app.

#### Returns

An object containing:
- `account`: The current account of the user.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

#### Examples

```ts
const { account } = useAccount();
console.log(account);
```

#### Defined in

[packages/react/src/hooks/useAccount.ts:19](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useAccount.ts#L19)

___
