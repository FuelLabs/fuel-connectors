# Running E2E Tests Locally

## Prerequisites
- Node.js v20.14.0
- PNPM v9.5.0
- Rust toolchain with `forc` and `fuel-core`

## Environment Setup
1. Copy `e2e-tests/runner/.env.example` to `e2e-tests/runner/.env`. They will have the required environment variables for local testing providing you have a local Fuel node running.
2. Copy `examples/react-app/.env.example` to `examples/react-app/.env`.
3. Copy `examples/react-next/.env.example` to `examples/react-next/.env`.

## Steps to Run Tests

1. **Start the Local Node**
   ```bash
   pnpm node:up
   ```

2. **Install Dependencies**
   ```bash
   pnpm install --frozen-lockfile
   ```

3. **Build Connectors**
   ```bash
   pnpm build:connectors
   ```

4. **Build and Deploy Contracts**
   ```bash
   cd e2e-tests/runner/scripts
   pnpm deploy:contracts
   ```

5. **Build and Deploy EVM Predicates**
   Copy `packages/evm-predicates/.env.example` to `packages/evm-predicates/.env`.
   From the root directory:
   ```bash
   cd packages/evm-predicates
   pnpm fuels build && pnpm fuels deploy
   ```

6. **Build and Deploy Solana Predicates**
   Copy `packages/solana-connector/.env.example` to `packages/solana-connector/.env`.
   ```bash
   cd packages/solana-connector
   pnpm fuels build && pnpm fuels deploy
   ```

7. **Install Playwright Browser**
   ```bash
   cd e2e-tests/runner
   pnpm exec playwright install --with-deps chromium
   ```

8. **Setup Synpress**
   ```bash
   cd e2e-tests/runner
   pnpm synpress wallet-setup
   ```

9. **Run the Tests**
   ```bash
   cd e2e-tests/runner
   pnpm test:e2e
   ```
   Or to run the Playwright UI and start the servers:
   ```bash
   cd e2e-tests/runner
   pnpm test:e2e:dev
   ```

## Environment Variables
- `VITE_FUEL_PROVIDER_URL`: URL for the local Fuel node (default: http://localhost:4000/v1/graphql)
- `NEXT_PUBLIC_WC_PROJECT_ID`: Your WalletConnect project ID
- `VITE_WALLET_SECRET`: Your wallet secret key
- `VITE_MASTER_WALLET_MNEMONIC`: Your wallet mnemonic phrase

## Notes
- The tests require a local Fuel node to be running
- All commands should be run from the project root unless specified otherwise
- Make sure you have the correct Rust toolchain version installed with `forc` and `fuel-core`
