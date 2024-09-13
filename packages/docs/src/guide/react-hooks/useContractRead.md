# useContractRead
---

A hook to read data from a smart contract in the connected app.

#### Params

The properties of the hook.
- `contract`: The contract instance or contract data (address, ABI, and provider).
- `functionName`: The name of the function to call on the contract.
- `args`: The arguments to pass to the contract function.

#### Returns

An object containing:
- The result of the contract function call.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

To read data from a contract
```ts
const { data } = useContractRead({
  contract: myContractInstance,
  functionName: 'getBalance',
  args: [userAddress],
});
console.log(data);
```

#### Defined in
[packages/react/src/hooks/useContractRead.ts:63](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useContractRead.ts#L63)

___
