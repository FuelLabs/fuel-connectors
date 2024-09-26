# useNetworks
---

A hook to retrieve all networks available in the connected app.

#### Returns

An object containing:
- `networks`:  List of all networks available for the current connection.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

To get the list of networks
```ts
const { networks } = useNetworks();
console.log(networks);
```

#### Defined in
[packages/react/src/hooks/useNetworks.ts:33](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useNetworks.ts#L33)

___
