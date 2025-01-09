# useIsSupportedNetwork
---

A hook to check if the current network, matches with provided networks config on FuelProvider.

#### Returns

An object containing:
- `isSupportedNetwork`: The value if the current network is supported.

#### Examples

To check if network is supported:
```ts
const { isSupportedNetwork } = useIsSupportedNetwork();
console.log(isSupportedNetwork);
```

#### Defined in
[packages/react/src/hooks/useIsSupportedNetwork.tsx:30](https://github.com/fuellabs/fuel-connectors/blob/main/packages/react/src/hooks/useIsSupportedNetwork.tsx#L30)

___
