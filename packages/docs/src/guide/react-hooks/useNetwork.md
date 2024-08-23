# useNetwork
---

A hook to retrieve the current network information in the connected app.

#### Returns

An object containing:
- `network`: The network information data.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

**`Example`**

```ts
const { network } = useNetwork();
console.log(network);
```

#### Defined in

[packages/react/src/hooks/useNetwork.ts:19](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useNetwork.ts#L19)

___
