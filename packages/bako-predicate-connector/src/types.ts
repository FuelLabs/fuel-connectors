import type { VaultConfig } from 'bakosafe';
import type {
  BytesLike,
  Predicate as FuelPredicate,
  Provider as FuelProvider,
  InputValue,
  JsonAbi,
  TransactionRequest,
} from 'fuels';

// ============================================================
// Utility types
// ============================================================

/**
 * Represents a value that might be undefined or null.
 */
export type Maybe<T> = T | undefined | null;

/**
 * Represents a union of three possible types.
 * Commonly used for flexible parameter types.
 */
export type Option<T1, T2, T3 = string> = T1 | T2 | T3;

/**
 * Represents a hash string with 0x prefix.
 */
export type Hash = `0x${string}`;

/**
 * Represents a value that might be async or sync.
 */
export type MaybeAsync<T> = Promise<T> | T;

// ============================================================
// Predicate-related types
// ============================================================

/**
 * Configuration for a custom predicate.
 */
export interface PredicateConfig {
  abi: JsonAbi;
  bin: BytesLike;
}

/**
 * Version information for a predicate.
 */
export interface PredicateVersion {
  predicate: PredicateConfig;
  generatedAt: number;
}

/**
 * Extended predicate version with metadata.
 */
export interface PredicateVersionWithMetadata {
  id: string;
  generatedAt: number;
  isActive: boolean;
  isSelected: boolean;
  isNewest: boolean;
  balance?: string;
  assetId?: string;
  accountAddress?: string;
}

// ============================================================
// Provider types
// ============================================================

/**
 * EIP-1193 compatible provider interface.
 * Extends EventEmitter for event handling.
 */
export interface EIP1193Provider {
  request(args: {
    method: string;
    params?: unknown[];
  }): Promise<unknown | unknown[]>;

  // Event emitter methods
  on(event: string, listener: (...args: unknown[]) => void): this;
  off(event: string, listener: (...args: unknown[]) => void): this;
  emit(event: string, ...args: unknown[]): boolean;
}

/**
 * Dictionary of providers used by the connector.
 */
export type ProviderDictionary = {
  fuelProvider: FuelProvider;
  ethProvider?: EIP1193Provider;
  [key: string]: Maybe<Option<FuelProvider, EIP1193Provider>>;
};

// ============================================================
// Transaction types
// ============================================================

/**
 * Prepared transaction with predicate information.
 */
export type PreparedTransaction = {
  predicate: FuelPredicate<InputValue[], { [name: string]: unknown }>;
  request: TransactionRequest;
  transactionId: string;
  account: string;
  transactionRequest: TransactionRequest;
};

/**
 * Message signature with curve information.
 */
export type SignedMessageCustomCurve = {
  curve: string;
  signature: string;
};

// ============================================================
// Bako Safe types
// ============================================================

/**
 * Personal wallet data stored in Bako Safe.
 * Contains address, configuration, and version information.
 */
export interface BakoPersonalWalletData {
  address: string;
  configurable: VaultConfig & { HASH_PREDICATE?: string };
  version: string;
}

// ============================================================
// Configuration types
// ============================================================

/**
 * Base configuration for connectors.
 * Allows for flexible configuration with string keys.
 */
export type ConnectorConfig = {
  [key: string]: unknown;
  predicateConfig?: PredicateConfig;
};
