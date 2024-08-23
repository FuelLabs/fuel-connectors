# useConnectors
---

A hook to fetch a list of connectors in the connected app.

#### Returns

An object containing:
- `connectors`: The list of available connectors.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

**`Example`**

```ts
const { connectors } = useConnectors();
console.log(connectors);
```

#### Defined in

[packages/react/src/hooks/useConnectors.ts:20](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useConnectors.ts#L20)

___
