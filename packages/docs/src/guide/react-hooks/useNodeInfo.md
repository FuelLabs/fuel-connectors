# useNodeInfo
---

A hook to fetch node information from the provider and check compatibility.

#### Returns

An object containing:
- `nodeInfo`: The node information data or `null`.
- `isCompatible`: Whether the node is compatible with the specified version.
- [Properties of `@tanstack/react-query`, `useQuery` method](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).

#### Params

The parameters to configure the hook.
- `version`: The minimum version of the node that is considered compatible.

#### Examples

To fetch node information and check compatibility
```ts
const { nodeInfo, isCompatible } = useNodeInfo({ version: '1.2.3' });
```

#### Defined in

[packages/react/src/hooks/useNodeInfo.ts:34](https://github.com/LeoCourbassier/fuel-connectors/blob/9fb74b5f15e12bc00681e63ea33b85bae3773662/packages/react/src/hooks/useNodeInfo.ts#L34)

___
