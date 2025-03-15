[![Build](https://github.com/FuelLabs/fuel-connectors/actions/workflows/pr.yaml/badge.svg)](https://github.com/FuelLabs/fuel-connectors/actions/workflows/pr.yaml)

# @fuels/connector

Collection of connectors for `fuels` SDK.
This package enables users to use their **wallets** to sign transactions on Fuel Network.

> **Warning**
> This project is under active development.

## 🧑‍💻 Getting Started

### Install

```sh
npm install fuels @fuels/connectors
```

### Usage

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

### Building the project

```sh
pnpm build
```

## Running E2E Tests Locally

The `fuel-connectors` project includes comprehensive end-to-end (E2E) tests to ensure robust functionality across all connectors. Follow the steps below to set up and run these tests locally.

### Prerequisites

Ensure you have the following installed on your system:

1. **Docker**: For running required services.
2. **Node.js (v20.11.0 or higher)**: Use the version specified in `.nvmrc` or the project configuration.
3. **PNPM**: Version `9.x` or higher. Install it globally if needed:
   ```bash
   npm install -g pnpm
   ```

---

### Steps to Run E2E Tests

1. **Install Dependencies**

   Navigate to the project root and install all dependencies:
   ```bash
   pnpm install
   ```

2. **Start the Local Test Node**

   Bring up the test node services using Docker:
   ```bash
   pnpm node:up
   ```

3. **Run E2E Tests**

   Run the full E2E test suite:
   ```bash
   pnpm test:e2e:local
   ```

   This script performs the following:
   - Deploys required contracts.
   - Starts the React and Next.js test servers.
   - Executes Playwright tests across all connectors.

---

### Additional Commands

- **Run Tests for Specific Connectors**  
  To run tests for an individual project:
  ```bash
  pnpm --filter @e2e-tests/runner test:react-app
  ```
React App is faster to build for e2e development.

- **Debug with Playwright UI**  
  Use Playwright's interactive UI for debugging tests:
  ```bash
  pnpm --filter @e2e-tests/runner test:e2e:ui
  ```

- **Stop the Local Test Node**  
  After testing, stop the test node to free up resources:
  ```bash
  pnpm node:down
  ```

---

### Troubleshooting

- **Port Conflicts**  
  If you encounter errors related to ports already in use, ensure no processes are running on the following ports:
  - `4000`: Fuel Provider
  - `5173`: React App
  - `3002`: Next.js App

## 📜 License

This repo is licensed under the `Apache-2.0` license. See [`LICENSE`](./LICENSE) for more information.
