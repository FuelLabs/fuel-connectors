# useProvider
---

A hook to retrieve the current provider in the connected app.

#### Returns

An object containing:
- `provider`: The provider data or `null`.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

**`Example`**

```ts
const { provider } = useProvider();
```

#### Defined in

[packages/react/src/hooks/useProvider.ts:18](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useProvider.ts#L18)

___
