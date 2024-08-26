# useConnectors
---

A hook to fetch a list of connectors in the connected app.

#### Returns

An object containing:
- `connectors`: The list of available connectors.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

#### Examples

To fetch connectors:
```ts
const { connectors } = useConnectors();
console.log(connectors);
```

#### Defined in

[packages/react/src/hooks/useConnectors.ts:21](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useConnectors.ts#L21)

___
