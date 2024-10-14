# useCurrentConnector
---

A hook to fetch a current Wallet Connector.

#### Params

Parameters to configure the hook.
- `query`: Additional query parameters to customize the behavior of `useNamedQuery`.

#### Returns

An object containing:
- `connectors`: The list of available connectors.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

To fetch current connector:
```ts
const { currentConnector } = useCurrentConnector();
console.log(currentConnector);
```

#### Defined in
[packages/react/src/hooks/useCurrentConnector.tsx:36](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useCurrentConnector.tsx#L36)

___
