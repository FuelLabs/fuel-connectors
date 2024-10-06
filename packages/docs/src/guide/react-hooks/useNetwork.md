# useNetwork
---

A hook to retrieve the current network information in the connected app.

#### Returns

An object containing:
- `network`: The network information data.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

To get the current network information
```ts
const { network } = useNetwork();
console.log(network);
```

#### Defined in
[packages/react/src/hooks/useNetwork.ts:29](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useNetwork.ts#L29)

___
