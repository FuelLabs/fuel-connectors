# Fuel Connectors - React App Implementation

This directory contains the implementation of connectors for integrating with different wallet types on the Fuel Network.

## Architecture

The implementation follows the **Template Method** pattern with a well-structured architecture:

### 1. **Base Class: `PredicateConnector`**
- **Location**: `common/PredicateConnector.ts`
- **Responsibilities**:
  - Bako Safe session management
  - Authentication and connection logic
  - Connection state control
  - Event emission
  - Socket management for real-time communication

### 2. **Specific Subclass `WalletConnectConnector`**
- **Responsibilities**:
  - WalletConnect/Web3Modal integration
  - EVM and Fuel provider management
  - Specific implementation of abstract methods
  - Interaction with EVM wallets (MetaMask, etc.)

### 3. **Implemented Pattern**
- **Template Method**: Base class defines the connection flow
- **Strategy**: Different adapters for different wallet types
- **Bridge**: Separates abstraction (connector) from implementation (specific wallet)

## File Structure

```
src/connector/
├── common/                          # Common infrastructure
│   ├── PredicateConnector.ts       # Abstract base class
│   ├── SocketClient.ts             # Socket client for Bako Safe
│   ├── types.ts                    # Shared types
│   ├── utils.ts                    # Utility functions
│   ├── networks.ts                 # Network configurations
│   └── index.ts                    # Common exports
├── wallet-connector/                # WalletConnect implementation
│   ├── WalletConnectConnector.ts   # Main connector class
│   ├── constants.ts                # Constants and configurations
│   ├── types.ts                    # Specific types
│   ├── web3Modal.ts                # Web3Modal configuration
│   └── index.ts                    # WalletConnect exports
├── index.ts                         # Main exports
└── README.md                        # Complete documentation
```

## How It Works

### **Connection Flow:**
1. **Dapp** calls `connector.connect()`
2. **Base class** executes common logic (Bako Safe setup)
3. **Subclass** implements specific wallet connection
4. **Base class** manages session and emits events

### **Dapp Usage Example:**
```typescript
// Dapp only knows the specific implementation
const connector = new WalletConnectConnector(config);
await connector.connect(); // Calls base class method
await connector.sendTransaction(address, tx); // Base class method
```

## Abstract Methods (Subclasses must implement)

```typescript
protected abstract _sign_message(message: string): Promise<string>;
protected abstract _get_providers(): Promise<ProviderDictionary>;
protected abstract _get_current_evm_address(): Maybe<string>;
protected abstract _require_connection(): MaybeAsync<void>;
protected abstract _config_providers(config: ConnectorConfig): MaybeAsync<void>;
protected abstract _connect(): Promise<boolean>;
protected abstract _disconnect(): Promise<boolean>;
```

## Extensibility

To add a new wallet type:

1. **Create new folder** for the wallet type (e.g., `solana-connector/`)
2. **Create new subclass** extending `PredicateConnector`
3. **Implement abstract methods** with wallet-specific logic
4. **Export** in the appropriate index file

## Naming Conventions

- **Abstract methods**: `_snake_case` (ex: `_sign_message`)
- **Public methods**: `camelCase` (ex: `sendTransaction`)
- **Private methods**: `camelCase` (ex: `setupEventListeners`)
- **Constants**: `UPPER_SNAKE_CASE` (ex: `DEFAULT_NETWORK_URL`)
- **Interfaces**: `PascalCase` (ex: `WalletConnectConfig`)
- **Classes**: `PascalCase` (ex: `WalletConnectConnector`)

## Dependencies

- **`fuels`**: Main Fuel SDK
- **`bakosafe`**: Bako Safe integration
- **`@wagmi/core`**: EVM wallet configuration
- **`@web3modal/wagmi`**: WalletConnect connection interface
- **`socket.io-client`**: Real-time communication

