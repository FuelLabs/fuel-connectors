# useChain
---

A hook that returns the chain info for the current provider.

#### Returns

An object containing:
- `chain`: The current chain info.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

#### Examples

```ts
const { chain } = useChain();
console.log(chain);
```

#### Defined in

[packages/react/src/hooks/useChain.ts:24](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useChain.ts#L24)

___
