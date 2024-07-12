---
"@fuel-connectors/burner-wallet-connector": patch
"@fuels/connectors": patch
---

- [Add support for burner wallet config on default connectors](https://github.com/FuelLabs/fuel-connectors/commit/fb845c0cfdfccfda60637af8d405964e9efbdecb)
- [Burner wallet storage not working on nodejs](https://github.com/FuelLabs/fuel-connectors/commit/bbf19a2f8b6faeafc5c99055fe2ce2beb2988400)
- [Create in memory storage on burner wallet](https://github.com/FuelLabs/fuel-connectors/commit/242b24f84f4ac35dba9c1332cb46c80bac5f4766)

Observation: Burner Wallet's Storage will not persist information between executions on Vercel or Node.js env.
