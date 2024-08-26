# useConnect
---

A hook to handle connection to the Fuel network in the connected app.

#### Returns

object An object containing:
- `connect`: A function to trigger the connection to the Fuel network.
- `connectAsync`: An async function to trigger the connection and return a promise.
- [Properties of `@tanstack/react-query`, `useMutation` method](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation).

#### Examples

To connect to the Fuel network
```ts
const { connect } = useConnect();
connect('myConnector');
```

#### Example

```ts
const { connectAsync } = useConnect();
await connectAsync('myConnector');

#### Defined in

[packages/react/src/hooks/useConnect.ts:27](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useConnect.ts#L27)

___
