# useDisconnect
---

A hook to disconnect from current connector.

#### Returns

An object containing:
- `disconnect`: A function to trigger the disconnection process synchronously.
- `disconnectAsync`: A function to trigger the disconnection process asynchronously.
- [`...mutationProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation): Destructured properties from `useMutation` result.

#### Examples

To disconnect synchronously:
```ts
const { disconnect } = useDisconnect();
disconnect();
```

To disconnect asynchronously:
```ts
const { disconnectAsync } = useDisconnect();
await disconnectAsync();
```

#### Defined in

[packages/react/src/hooks/useDisconnect.ts:27](https://github.com/LeoCourbassier/fuel-connectors/blob/f33236b78c83c4d8956637865372a08961d56b69/packages/react/src/hooks/useDisconnect.ts#L27)

___
