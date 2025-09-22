# useNodeInfo
---

A hook to fetch node information from the provider and check compatibility.

#### Params

The parameters to configure the hook.
- `version`: The minimum version of the node that is considered compatible.

#### Returns

An object containing:
- `nodeInfo`: The node information data or `null`.
- `isCompatible`: Whether the node is compatible with the specified version.
- [`...queryProps`](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery): Destructured properties from `useQuery` result.

#### Examples

To fetch node information and check compatibility
```ts
const { nodeInfo, isCompatible } = useNodeInfo({ version: '1.2.3' });
```

#### Defined in
[packages/react/src/hooks/useNodeInfo.ts:44](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useNodeInfo.ts#L44)

___
