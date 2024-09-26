# useAssets
---

A hook that returns assets of the user in the connected app.

#### Returns

An object containing
- `assets`: User's assets.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

```ts
const { assets } = useAssets();
console.log(assets);
```

#### Defined in
[packages/react/src/hooks/useAssets.ts:27](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useAssets.ts#L27)

___
