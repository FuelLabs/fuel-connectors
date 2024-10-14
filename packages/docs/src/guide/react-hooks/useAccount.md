# useAccount
---

A hook to get the current account of the user in the connected app.

#### Returns

An object containing:
- `account`: The current account of the user.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

```ts
const { account } = useAccount();
console.log(account);
```

#### Defined in
[packages/react/src/hooks/useAccount.ts:29](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useAccount.ts#L29)

___
