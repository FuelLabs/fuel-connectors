# useAddAssets
---

A hook to add one or more assets in the connected app asynchronously or synchronously.

#### Returns

An object containing:
- `addAssets`: function to add assets synchronously
- `addAssetsAsync`: function to add assets asynchronously.
- [Properties of `@tanstack/react-query`, `useMutation` method](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation).

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

[packages/react/src/hooks/useAddAssets.ts:29](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useAddAssets.ts#L29)

___
