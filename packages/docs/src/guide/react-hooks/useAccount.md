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

[packages/react/src/hooks/useAccount.ts:19](https://github.com/LeoCourbassier/fuel-connectors/blob/f33236b78c83c4d8956637865372a08961d56b69/packages/react/src/hooks/useAccount.ts#L19)

___
