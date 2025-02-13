# useChainId
---

A hook that returns the chain ID for the current provider.

#### Returns

An object containing:
- `chainId`: The current chain ID.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

```ts
const { chainId } = useChainId();
console.log(chainId);
```

#### Defined in
[packages/react/src/hooks/useChainId.ts:32](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useChainId.ts#L32)

___
