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

[packages/react/src/hooks/useNetwork.ts:20](https://github.com/LeoCourbassier/fuel-connectors/blob/f33236b78c83c4d8956637865372a08961d56b69/packages/react/src/hooks/useNetwork.ts#L20)

___
