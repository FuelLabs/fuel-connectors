# @fuels/connector

Collection of connectors for `fuels` SDK.
This package enables users to use their **wallets** to sign transactions on Fuel Network.

> **Warning**
> This project is under active development.

## 🧑‍💻 Getting Started

### Install:

```sh
npm install fuels @fuels/connectors
```

### Usage:

```ts
import { Fuel } from "fuels";
import { FuelWalletConnector } from "@fuels/connectors";

const fuel = new Fuel({
  connectors: [
    new FuelWalletConnector(),
  ],
});

await fuel.selectConnector("Fuel Wallet");
const connection = await fuel.connect();
console.log(connection);
```

## 🚧 Development

### Building the project:

```sh
pnpm build
```

## 📜 License

This repo is licensed under the `Apache-2.0` license. See [`LICENSE`](./LICENSE) for more information.
