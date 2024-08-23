# useAddAssets
---

A hook to add one or more assets in the connected app asynchronously or synchronously.

#### Returns

An object containing:
- `addAssets`: function to add assets synchronously
- `addAssetsAsync`: function to add assets asynchronously.
- [Properties of `@tanstack/react-query`, `useMutation` method](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation).

**`Example`**

```ts
const { addAssets } = useAddAssets();
addAssets(asset);
```

**`Example`**

```ts
const { addAssetsAsync } = useAddAssets();
await addAssetsAsync([asset1, asset2]);
```

#### Defined in

[packages/react/src/hooks/useAddAssets.ts:28](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useAddAssets.ts#L28)

___
