# useAssets
---

A hook that returns assets of the user in the connected app.

#### Returns

An object containing
- `assets`: User's assets.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

#### Examples

```ts
const { assets } = useAssets();
console.log(assets);
```

#### Defined in

[packages/react/src/hooks/useAssets.ts:20](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useAssets.ts#L20)

___
