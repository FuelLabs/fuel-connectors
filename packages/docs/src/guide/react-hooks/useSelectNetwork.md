# useSelectNetwork
---

A hook to add a network in the connected app.

#### Returns

An object containing:
- `selectNetwork`: function to add a network synchronously.
- `selectNetworkAsync` function to add a network asynchronously.
- [`...mutationProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation): Destructured properties from `useMutation` result.

#### Examples

To select a network synchronously:
```ts
const { selectNetwork } = useSelectNetwork();
selectNetwork(network);
```

To select a network asynchronously:
```ts
const { selectNetworkAsync } = useSelectNetwork();
await selectNetworkAsync(network);
```

#### Defined in
[packages/react/src/hooks/useSelectNetwork.ts:27](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useSelectNetwork.ts#L27)

___
