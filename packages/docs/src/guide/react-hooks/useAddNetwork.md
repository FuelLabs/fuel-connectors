# useAddNetwork
---

A hook to add a network in the connected app.

#### Returns

An object containing:
- `addNetwork`: function to add a network synchronously
- `addNetworkAsync` function to add a network asynchronously.
- [Properties of `@tanstack/react-query`, `useMutation` method](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation).

**`Example`**

```ts
const { addNetwork } = useAddNetwork();
addNetwork(network);
```

**`Example`**

```ts
const { addNetworkAsync } = useAddNetwork();
await addNetworkAsync(network);
```

#### Defined in

[packages/react/src/hooks/useAddNetwork.ts:28](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useAddNetwork.ts#L28)

___
