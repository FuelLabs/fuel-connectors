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

[packages/react/src/hooks/useAssets.ts:20](https://github.com/LeoCourbassier/fuel-connectors/blob/f33236b78c83c4d8956637865372a08961d56b69/packages/react/src/hooks/useAssets.ts#L20)

___
