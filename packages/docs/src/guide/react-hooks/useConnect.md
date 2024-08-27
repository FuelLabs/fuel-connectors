# useConnect
---

A hook to handle connection to the Fuel network in the connected app.

#### Returns

An object containing:
- `connect`: A function to trigger the connection to the Fuel network.
- `connectAsync`: An async function to trigger the connection and return a promise.
- [`...mutationProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation): Destructured properties from `useMutation` result.

#### Examples

To connect to the Fuel network
```ts
const { connect } = useConnect();
connect('myConnector');
```
