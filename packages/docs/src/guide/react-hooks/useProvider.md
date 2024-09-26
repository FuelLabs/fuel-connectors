# useProvider
---

A hook to retrieve the current provider in the connected app.

#### Returns

An object containing:
- `provider`: The provider data or `null`.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

To get the current provider:
```ts
const { provider } = useProvider();
```

#### Defined in
[packages/react/src/hooks/useProvider.ts:32](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useProvider.ts#L32)

___
