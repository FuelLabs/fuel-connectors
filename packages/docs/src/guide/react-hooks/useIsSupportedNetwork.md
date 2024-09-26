# useIsSupportedNetwork
---

A hook to check if the current network, matches with provided networks config on FuelProvider.

#### Returns

An object containing:
- `isSupportedNetwork`: The value if the current network is supported.

| Name | Type |
| :------ | :------ |
| `isSupportedNetwork` | `boolean` |

#### Examples

To check if network is supported:
```ts
const { isSupportedNetwork } = useIsSupportedNetwork();
console.log(isSupportedNetwork);
```

#### Defined in
[packages/react/src/hooks/useIsSupportedNetwork.tsx:25](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useIsSupportedNetwork.tsx#L25)

___
