# useContractRead
---

A hook to read data from a smart contract in the connected app.

#### Returns

An object containing:
- The result of the contract function call.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

#### Params

The properties of the hook.
- `contract`: The contract instance or contract data (address, ABI, and provider).
- `functionName`: The name of the function to call on the contract.
- `args`: The arguments to pass to the contract function.

#### Throws

Throws an error if the contract or function is invalid or if the function attempts to write to storage.

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

[packages/react/src/hooks/useContractRead.ts:66](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useContractRead.ts#L66)

___
