# useAddNetwork
---

A hook to add a network in the connected app.

#### Returns

An object containing:
- `addNetwork`: function to add a network synchronously.
- `addNetworkAsync` function to add a network asynchronously.
- [`...mutationProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation): Destructured properties from `useMutation` result.

#### Examples

To add a network synchronously:
```ts
const { addNetwork } = useAddNetwork();
addNetwork(network);
```

To add a network asynchronously:
```ts
const { addNetworkAsync } = useAddNetwork();
await addNetworkAsync(network);
```

#### Defined in
[packages/react/src/hooks/useAddNetwork.ts:29](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useAddNetwork.ts#L29)

___
