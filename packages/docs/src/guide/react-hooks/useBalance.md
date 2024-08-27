# useBalance
---

A hook that returns the balance of the user.

#### Params

The options to fetch the balance for.
- `address`: The address to fetch the balance for.
- `assetId`: The asset ID to fetch the balance for.

#### Returns

An object containing:
- `balance`: The balance of the user.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

```ts
const { balance } = useBalance({address: '0x1234', assetId: '0x1234'});
console.log(balance.format());
```

#### Defined in

[packages/react/src/hooks/useBalance.ts:39](https://github.com/LeoCourbassier/fuel-connectors/blob/f33236b78c83c4d8956637865372a08961d56b69/packages/react/src/hooks/useBalance.ts#L39)

___
