# useChain
---

A hook that returns the chain info for the current provider.

#### Returns

An object containing:
- `chain`: The current chain info.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

```ts
const { chain } = useChain();
console.log(chain);
```

#### Defined in
[packages/react/src/hooks/useChain.ts:24](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useChain.ts#L24)

___
