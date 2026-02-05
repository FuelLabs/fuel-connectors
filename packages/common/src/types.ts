import type EventEmitter from 'node:events';
import type {
  BN,
  BytesLike,
  Predicate as FuelPredicate,
  Provider as FuelProvider,
  InputValue,
  JsonAbi,
  TransactionRequest,
} from 'fuels';

export type Maybe<T> = T | undefined | null;
export type Option<T1, T2, T3 = string> = T1 | T2 | T3;
export type Hash = `0x${string}`;
export type MaybeAsync<T> = Promise<T> | T;

export interface PredicateConfig {
  abi: JsonAbi;
  bin: BytesLike;
}

export interface PredicateVersion {
  predicate: PredicateConfig;
  generatedAt: number;
}

export interface EIP1193Provider extends EventEmitter {
  request(args: {
    method: string;
    params?: unknown[];
  }): Promise<unknown | unknown[]>;
}

export type ConnectorConfig = {
  [key: string]: unknown;
  predicateConfig?: PredicateConfig;
};

export type ProviderDictionary = {
  fuelProvider: FuelProvider;
  ethProvider?: EIP1193Provider | null;
  [key: string]: Maybe<Option<FuelProvider, EIP1193Provider>>;
};

export type PreparedTransaction = {
  predicate: FuelPredicate<InputValue[], { [name: string]: unknown }>;
  request: TransactionRequest;
  transactionId: string;
  account: string;
  transactionRequest: TransactionRequest;
};

export type SignedMessageCustomCurve = {
  curve: string;
  signature: string;
};

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

/**
 * Enum for Privy authentication event types.
 */
export enum PrivyAuthEventTypes {
  authenticated = 'authenticated',
  ready = 'ready',
  user = 'user',
  embeddedWallet = 'embeddedWallet',
}

/**
 * Observer interface for Privy authentication state changes.
 *
 * Generic interface that allows decoupled communication between
 * a React provider and connectors without direct dependencies.
 *
 * The React provider implements this interface and injects it into connectors.
 * Connectors only know about this interface, not the implementation.
 *
 * Type Parameters:
 * - TUser: The user type (e.g., Privy's User)
 * - TEmbeddedWallet: The embedded wallet type (e.g., Privy's ConnectedWallet)
 *
 * Events (via EventEmitter):
 * - 'authenticated': Emitted when authentication state changes (boolean)
 * - 'ready': Emitted when Privy ready state changes (boolean)
 * - 'user': Emitted when user object changes (TUser | undefined)
 * - 'embeddedWallet': Emitted when embedded wallet changes (TEmbeddedWallet | undefined)
 */
export interface IPrivyAuthObserver<
  TUser = unknown,
  TEmbeddedWallet = unknown,
> {
  /**
   * Subscribe to an event (inherited from EventEmitter).
   */
  on(
    event: PrivyAuthEventTypes.authenticated,
    listener: (value: boolean) => void,
  ): void;
  on(
    event: PrivyAuthEventTypes.ready,
    listener: (value: boolean) => void,
  ): void;
  on(event: PrivyAuthEventTypes.user, listener: (value?: TUser) => void): void;
  on(
    event: PrivyAuthEventTypes.embeddedWallet,
    listener: (value?: TEmbeddedWallet) => void,
  ): void;

  /**
   * Unsubscribe from an event (inherited from EventEmitter).
   */
  off(
    event: PrivyAuthEventTypes.authenticated,
    listener: (value: boolean) => void,
  ): void;
  off(
    event: PrivyAuthEventTypes.ready,
    listener: (value: boolean) => void,
  ): void;
  off(event: PrivyAuthEventTypes.user, listener: (value?: TUser) => void): void;
  off(
    event: PrivyAuthEventTypes.embeddedWallet,
    listener: (value?: TEmbeddedWallet) => void,
  ): void;

  /**
   * Get current authentication state snapshot.
   */
  getState(): {
    authenticated: boolean;
    ready: boolean;
    user?: TUser;
    embeddedWallet?: TEmbeddedWallet;
  };
}
