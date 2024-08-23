# useAssets
---

A hook that returns assets of the user in the connected app.

#### Returns

An object containing
- `assets`: User's assets.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

**`Example`**

```ts
const { assets } = useAssets();
console.log(assets);
```

#### Defined in

[packages/react/src/hooks/useAssets.ts:20](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useAssets.ts#L20)

___
