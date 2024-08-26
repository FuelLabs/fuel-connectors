# useProvider
---

A hook to retrieve the current provider in the connected app.

#### Returns

An object containing:
- `provider`: The provider data or `null`.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

#### Examples

To get the current provider:
```ts
const { provider } = useProvider();
```

#### Defined in

[packages/react/src/hooks/useProvider.ts:19](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useProvider.ts#L19)

___
