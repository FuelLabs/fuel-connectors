# useChain
---

A hook that returns the chain info for the current provider.

#### Returns

An object containing:
- `chain`: The current chain info.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

**`Example`**

```ts
const { chain } = useChain();
console.log(chain);
```

#### Defined in

[packages/react/src/hooks/useChain.ts:24](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useChain.ts#L24)

___
