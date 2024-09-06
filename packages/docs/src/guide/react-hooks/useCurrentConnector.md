# useCurrentConnector
---

A hook to fetch the connected connector.

#### Returns

An object containing:
- `connector`: The connected connector.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

To fetch the connector:
```ts
const { connector } = useCurrentConnector();
console.log(connector);
```

#### Defined in
[packages/react/src/hooks/useCurrentConnector.ts:20](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useCurrentConnector.ts#L20)

___
