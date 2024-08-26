# useDisconnect
---

A hook that disconnects a connected connector in the connected app.

#### Returns

An object containing:
- `disconnect`: A function to trigger the disconnection process synchronously.
- `disconnectAsync`: A function to trigger the disconnection process asynchronously.
- [Properties of `@tanstack/react-query`, `useMutation` method](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation).

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

[packages/react/src/hooks/useDisconnect.ts:27](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useDisconnect.ts#L27)

___
