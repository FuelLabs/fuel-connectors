# useAddAssets
---

A hook to add one or more assets in the connected app asynchronously or synchronously.

#### Returns

An object containing:
- `addAssets`: function to add assets synchronously
- `addAssetsAsync`: function to add assets asynchronously.
- [`...mutationProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation): Destructured properties from `useMutation` result.

#### Examples

To add assets synchronously:
```ts
const { addAssets } = useAddAssets();
addAssets(asset);
```

To add assets asynchronously:
```ts
const { addAssetsAsync } = useAddAssets();
await addAssetsAsync([asset1, asset2]);
```

#### Defined in

[packages/react/src/hooks/useAddAssets.ts:29](https://github.com/LeoCourbassier/fuel-connectors/blob/f33236b78c83c4d8956637865372a08961d56b69/packages/react/src/hooks/useAddAssets.ts#L29)

___
