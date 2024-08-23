# useDisconnect
---

A hook that disconnects a connected connector in the connected app.

#### Returns

An object containing:
- `disconnect`: A function to trigger the disconnection process synchronously.
- `disconnectAsync`: A function to trigger the disconnection process asynchronously.
- [Properties of `@tanstack/react-query`, `useMutation` method](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation).

**`Example`**

```ts
const { disconnect } = useDisconnect();
disconnect();
```

**`Example`**

```ts
const { disconnectAsync } = useDisconnect();
await disconnectAsync();
```

#### Defined in

[packages/react/src/hooks/useDisconnect.ts:26](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useDisconnect.ts#L26)

___
