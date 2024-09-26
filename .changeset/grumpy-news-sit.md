---
"@fuels/react": minor
---

- Add `query` options for customization of `useNamedQuery` on hooks. This can help to improve number of requests in cases of multiple checks like balances.

    ```ts
    import { useBalance } from '@fuels/react';
    const { balance } = useBalance({ address: '0x1234', assetId: '0x1234', query: { refetchInterval: 1000 } });
    ```

- Add Networks configuration to `FuelUIProvider` to allow users to provide a list of supported networks with their repesctive bridges.
- Add `suggestBridge` option to `FuelUIProvider` to enable/disable the bridge dialog for users flows.

    ```ts
    <FuelProvider
    uiConfig={{
        suggestBridge: true,
        networks: [
        {
            chainId: CHAIN_IDS.fuel.testnet,
            bridgeURL: 'https://app.fuel.network/bridge?from=eth&to=fuel&auto_close=true',
        },
        ],
    }}>
    </FuelProvider>
    ```

- Add `useIsSupportedNetwork` hook to check if the current network is supported by the user.

    ```ts
    import { useIsSupportedNetwork } from '@fuels/react';
    const { isSupportedNetwork } = useIsSupportedNetwork();
    ```

