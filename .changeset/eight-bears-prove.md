---
"@fuel-connectors/walletconnect-connector": patch
---

- Add `currentEvmAccount` method to `WalletConnectConnector`, which will return the current ethereum account connected.
- Fixed Wallet Connect Web3Modal instances conflicting and replacing Solana's
- Fixed issue where Wallet Connect's Web3Modal would reference a different Wagmi config instance.
- WalletConnect connector now recovers the last active connection during initialization
- Updated wagmi and @wagmi/core to 2.11.3
- Updated @wagmi/connectors to 5.0.26
