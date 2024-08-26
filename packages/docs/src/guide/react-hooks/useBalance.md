# useBalance
---

A hook that returns the balance of the user.

#### Returns

An object containing:
- `balance`: The balance of the user.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

#### Params

The options to fetch the balance for.
- `address`: The address to fetch the balance for.
- `assetId`: The asset ID to fetch the balance for.

#### Examples

```ts
const { balance } = useBalance({address: '0x1234', assetId: '0x1234'});
console.log(balance.format());
```

#### Defined in

[packages/react/src/hooks/useBalance.ts:39](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useBalance.ts#L39)

___
