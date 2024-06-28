---
"@fuel-connectors/walletconnect-connector": minor
---

`ping` method should never take more than 1 second.
Specially when it's the `WalletConnect`, since it doesn't relate to the Fuel network directly.
