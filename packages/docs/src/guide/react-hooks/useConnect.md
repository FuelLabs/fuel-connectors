# useConnect
---

A hook to handle connection to the Fuel network in the connected app.

#### Returns

object An object containing:
- `connect`: A function to trigger the connection to the Fuel network.
- `connectAsync`: An async function to trigger the connection and return a promise.
- [Properties of `@tanstack/react-query`, `useMutation` method](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation).

**`Example`**

```ts
const { connect } = useConnect();
connect('myConnector');
```

**`Example`**

```ts
const { connectAsync } = useConnect();
await connectAsync('myConnector');

#### Defined in

[packages/react/src/hooks/useConnect.ts:26](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useConnect.ts#L26)

___
