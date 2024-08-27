# useConnectors
---

A hook to fetch a list of connectors in the connected app.

#### Returns

An object containing:
- `connectors`: The list of available connectors.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

To fetch connectors:
```ts
const { connectors } = useConnectors();
console.log(connectors);
```

#### Defined in

[packages/react/src/hooks/useConnectors.ts:21](https://github.com/LeoCourbassier/fuel-connectors/blob/f33236b78c83c4d8956637865372a08961d56b69/packages/react/src/hooks/useConnectors.ts#L21)

___
