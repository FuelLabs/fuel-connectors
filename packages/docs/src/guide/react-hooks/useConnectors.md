# useConnectors
---

A hook to fetch a list of connectors in the connected app.

#### Params

Parameters to configure the hook.
- `query`: Additional query parameters to customize the behavior of `useNamedQuery`.

#### Returns

An object containing:
- `connectors`: The list of available connectors.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

To fetch connectors:
```ts
const { connectors } = useConnectors();
console.log(connectors);
```

#### Defined in
[packages/react/src/hooks/useConnectors.ts:31](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useConnectors.ts#L31)

___
