# useAddNetwork
---

A hook to add a network in the connected app.

#### Returns

An object containing:
- `addNetwork`: function to add a network synchronously
- `addNetworkAsync` function to add a network asynchronously.
- [Properties of `@tanstack/react-query`, `useMutation` method](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation).

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

[packages/react/src/hooks/useAddNetwork.ts:29](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useAddNetwork.ts#L29)

___
