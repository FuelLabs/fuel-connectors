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
  signMessage = 'signMessage',
  sendCode = 'sendCode',
  loginWithCode = 'loginWithCode',
  login = 'login',
  logout = 'logout',
  createWallet = 'createWallet',
}

/**
 * Type definition for Privy authentication observer types.
 * Groups all type parameters into a single object for cleaner interfaces.
 */
export type TPrivyAuthObserver = {
  User?: unknown;
  EmbeddedWallet?: unknown;
  SignMessage?: unknown;
  SendCode?: unknown;
  LoginWithCode?: unknown;
  Login?: unknown;
  Logout?: unknown;
  CreateWallet?: unknown;
};

/**
 * Observer interface for Privy authentication state changes.
 *
 * Generic interface that allows decoupled communication between
 * a React provider and connectors without direct dependencies.
 *
 * The React provider implements this interface and injects it into connectors.
 * Connectors only know about this interface, not the implementation.
 *
 * Type Parameter:
 * - T: Observer type object with User, EmbeddedWallet, and function types
 *
 * Events (via EventEmitter):
 * - 'authenticated': Emitted when authentication state changes (boolean)
 * - 'ready': Emitted when Privy ready state changes (boolean)
 * - 'user': Emitted when user object changes (T['User'] | undefined)
 * - 'embeddedWallet': Emitted when embedded wallet changes (T['EmbeddedWallet'] | undefined)
 * - 'signMessage': Emitted when signMessage function changes (T['SignMessage'] | undefined)
 * - 'sendCode': Emitted when sendCode function changes (T['SendCode'] | undefined)
 * - 'loginWithCode': Emitted when loginWithCode function changes (T['LoginWithCode'] | undefined)
 * - 'login': Emitted when login function changes (T['Login'] | undefined)
 * - 'logout': Emitted when logout function changes (T['Logout'] | undefined)
 * - 'createWallet': Emitted when createWallet function changes (T['CreateWallet'] | undefined)
 */
export interface IPrivyAuthObserver<
  T extends TPrivyAuthObserver = TPrivyAuthObserver,
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
  on(
    event: PrivyAuthEventTypes.user,
    listener: (value?: T['User']) => void,
  ): void;
  on(
    event: PrivyAuthEventTypes.embeddedWallet,
    listener: (value?: T['EmbeddedWallet']) => void,
  ): void;
  on(
    event: PrivyAuthEventTypes.signMessage,
    listener: (value?: T['SignMessage']) => void,
  ): void;
  on(
    event: PrivyAuthEventTypes.sendCode,
    listener: (value?: T['SendCode']) => void,
  ): void;
  on(
    event: PrivyAuthEventTypes.loginWithCode,
    listener: (value?: T['LoginWithCode']) => void,
  ): void;
  on(
    event: PrivyAuthEventTypes.login,
    listener: (value?: T['Login']) => void,
  ): void;
  on(
    event: PrivyAuthEventTypes.logout,
    listener: (value?: T['Logout']) => void,
  ): void;
  on(
    event: PrivyAuthEventTypes.createWallet,
    listener: (value?: T['CreateWallet']) => void,
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
  off(
    event: PrivyAuthEventTypes.user,
    listener: (value?: T['User']) => void,
  ): void;
  off(
    event: PrivyAuthEventTypes.embeddedWallet,
    listener: (value?: T['EmbeddedWallet']) => void,
  ): void;
  off(
    event: PrivyAuthEventTypes.signMessage,
    listener: (value?: T['SignMessage']) => void,
  ): void;
  off(
    event: PrivyAuthEventTypes.sendCode,
    listener: (value?: T['SendCode']) => void,
  ): void;
  off(
    event: PrivyAuthEventTypes.loginWithCode,
    listener: (value?: T['LoginWithCode']) => void,
  ): void;
  off(
    event: PrivyAuthEventTypes.login,
    listener: (value?: T['Login']) => void,
  ): void;
  off(
    event: PrivyAuthEventTypes.logout,
    listener: (value?: T['Logout']) => void,
  ): void;
  off(
    event: PrivyAuthEventTypes.createWallet,
    listener: (value?: T['CreateWallet']) => void,
  ): void;

  /**
   * Get current authentication state snapshot.
   */
  getState(): {
    authenticated: boolean;
    ready: boolean;
    user?: T['User'];
    embeddedWallet?: T['EmbeddedWallet'];
    signMessage?: T['SignMessage'];
    sendCode?: T['SendCode'];
    loginWithCode?: T['LoginWithCode'];
    login?: T['Login'];
    logout?: T['Logout'];
    createWallet?: T['CreateWallet'];
  };
}
