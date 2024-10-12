# useConnect
---

A hook to handle connection to the Fuel network in the connected app.

#### Params

The properties of the hook.
- `connectorName`: The connector's name to use in the connect function.

#### Returns

An object containing:
- `connect`: function to connect to the Fuel Network synchronously.
- `connectAsync`: function to connect to the Fuel Network asynchronously.
- [`...mutationProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation): Destructured properties from `useMutation` result.

#### Examples

To connect to the Fuel network
```ts
const { connect } = useConnect();
connect('myConnector');
```

#### Defined in
[packages/react/src/hooks/useConnect.ts:31](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useConnect.ts#L31)

___
