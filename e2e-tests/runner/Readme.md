# Running E2E Tests Locally

## Prerequisites
- Node.js v20.11.0
- PNPM v9.5.0
- Rust toolchain with `forc` and `fuel-core`

## Environment Setup
1. Create a `.env` file in the `e2e-tests/runner` directory:

   ```env
   # Provider URLs (local node)
   VITE_FUEL_PROVIDER_URL="http://localhost:4000/v1/graphql"
   NEXT_PUBLIC_PROVIDER_URL="http://localhost:4000/v1/graphql"

   # Project and chain configuration
   NEXT_PUBLIC_WC_PROJECT_ID="your_wc_project_id"
   NEXT_PUBLIC_CHAIN_ID_NAME="testnet"
   VITE_APP_WC_PROJECT_ID="your_wc_project_id"
   VITE_CHAIN_ID_NAME="local"

   # Wallet configuration
   VITE_WALLET_SECRET="your_wallet_secret"
   VITE_MASTER_WALLET_MNEMONIC="your_wallet_mnemonic"

   # Port settings
   REACT_APP_PORT=5173
   REACT_NEXT_PORT=3002
   PORT=5173
   ```

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
   pnpm deploy:contracts:ci
   ```

5. **Build and Deploy EVM Predicates**
   ```bash
   cd packages/evm-predicates
   pnpm fuels build && pnpm fuels deploy
   ```

6. **Install Playwright Browser**
   ```bash
   cd e2e-tests/runner
   pnpm exec playwright install --with-deps chromium
   ```

7. **Setup Synpress**
   ```bash
   cd e2e-tests/runner
   pnpm synpress wallet-setup
   ```

8. **Run the Tests**
   ```bash
   cd e2e-tests/runner
   pnpm test:e2e
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