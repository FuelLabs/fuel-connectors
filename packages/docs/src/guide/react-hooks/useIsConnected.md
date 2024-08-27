# useIsConnected
---

A hook to check the connection status with the connector.

#### Returns

An object containing:
- `isConnected`: A boolean value indicating the connector is connected.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

To check if a connection is established:
```ts
const { isConnected } = useIsConnected();
```

#### Defined in

[packages/react/src/hooks/useIsConnected.ts:19](https://github.com/LeoCourbassier/fuel-connectors/blob/f33236b78c83c4d8956637865372a08961d56b69/packages/react/src/hooks/useIsConnected.ts#L19)

___
