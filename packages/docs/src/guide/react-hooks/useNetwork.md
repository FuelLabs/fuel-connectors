# useNetwork
---

A hook to retrieve the current network information in the connected app.

#### Returns

An object containing:
- `network`: The network information data.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

#### Examples

To get the current network information
```ts
const { network } = useNetwork();
console.log(network);
```

#### Defined in

[packages/react/src/hooks/useNetwork.ts:20](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useNetwork.ts#L20)

___
