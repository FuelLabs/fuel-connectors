# useContractRead
---

A hook to read data from a smart contract in the connected app.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `TAbi` | extends `JsonAbi` | The ABI of the contract. |
| `TFunctionName` | extends `string` | The name of the function to call on the contract. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `props` | `ContractReadProps`\<`TAbi`, `TFunctionName`\> | The properties of the hook. |

#### Returns

An object containing:
- The result of the contract function call.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

**`Throws`**

Throws an error if the contract or function is invalid or if the function attempts to write to storage.

**`Example`**

```ts
const { data } = useContractRead({
  contract: myContractInstance,
  functionName: 'getBalance',
  args: [userAddress],
});
console.log(data);
```

#### Defined in

[packages/react/src/hooks/useContractRead.ts:63](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useContractRead.ts#L63)

___
