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

[packages/react/src/hooks/useChain.ts:24](https://github.com/LeoCourbassier/fuel-connectors/blob/f33236b78c83c4d8956637865372a08961d56b69/packages/react/src/hooks/useChain.ts#L24)

___
