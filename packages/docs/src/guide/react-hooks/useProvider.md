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

[packages/react/src/hooks/useProvider.ts:19](https://github.com/LeoCourbassier/fuel-connectors/blob/f33236b78c83c4d8956637865372a08961d56b69/packages/react/src/hooks/useProvider.ts#L19)

___
