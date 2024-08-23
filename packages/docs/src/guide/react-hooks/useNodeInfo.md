# useNodeInfo
---

A hook to fetch node information from the provider and check compatibility.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `NodeInfoParams` | Parameters to configure the hook. |

#### Returns

An object containing:
- `nodeInfo`: The node information data or `null`.
- `isCompatible`: Whether the node is compatible with the specified version.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

**`Example`**

```ts
const { nodeInfo, isCompatible } = useNodeInfo({ version: '1.2.3' });
```

#### Defined in

[packages/react/src/hooks/useNodeInfo.ts:31](https://github.com/LeoCourbassier/fuel-connectors/blob/3be030f46c51ceec060dd54c83d891fef5f785a0/packages/react/src/hooks/useNodeInfo.ts#L31)

___
