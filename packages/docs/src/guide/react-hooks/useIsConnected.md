# useIsConnected
---

A hook to check the connection status with the connector.

#### Returns

An object containing:
- `isConnected`: A boolean value indicating the connector is connected.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

#### Examples

To check if a connection is established:
```ts
const { isConnected } = useIsConnected();
```

#### Defined in

[packages/react/src/hooks/useIsConnected.ts:19](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useIsConnected.ts#L19)

___
