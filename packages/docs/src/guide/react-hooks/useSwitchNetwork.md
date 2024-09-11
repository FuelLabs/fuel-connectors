# useSwitchNetwork
---

A hook to switch to the provided network in the connected app.
The hook checks if the provided network exists.
If it doesn’t, it adds the network.
Otherwise, it simply selects the existing network.

#### Returns

An object containing:
- `switchNetwork`: function to add a network synchronously.
- `switchNetworkAsync` function to add a network asynchronously.
- [`...mutationProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation): Destructured properties from `useMutation` result.

#### Examples

To switch to a network synchronously:
```ts
const { switchNetwork } = useSwitchNetwork();
switchNetwork(network);
```

To switch to a network asynchronously:
```ts
const { switchNetworkAsync } = useSwitchNetwork();
await switchNetworkAsync(network);
```

#### Defined in
[packages/react/src/hooks/useSwitchNetwork.ts:31](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useSwitchNetwork.ts#L31)

___
