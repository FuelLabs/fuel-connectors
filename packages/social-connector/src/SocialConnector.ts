import {
  CHAIN_IDS,
  type ConnectorMetadata,
  FuelConnectorEventTypes,
  Provider as FuelProvider,
} from 'fuels';

import {
  EthereumWalletAdapter,
  type Maybe,
  PredicateConnector,
  type PredicateVersion,
  type PredicateWalletAdapter,
  type ProviderDictionary,
  getPredicateVersions,
  getProviderUrl,
} from '@fuel-connectors/bako-predicate-connector';

import {
  type IPrivyAuthObserver,
  PrivyAuthEventTypes,
} from '@fuel-connectors/common';

import type { ConnectedWallet, User } from '@privy-io/react-auth';
import {
  DEFAULT_POLL_INTERVAL_MS,
  FAST_POLL_INTERVAL_MS,
  HAS_WINDOW,
  SLOW_POLL_INTERVAL_MS,
  SOCIAL_ICON,
  TIMEOUTS,
} from './constants';
import type {
  ObserverListenersType,
  PrivyAuthInterface,
  SocialConnectorConfig,
} from './types';

export class SocialConnector extends PredicateConnector {
  name = 'Social Login';
  installed = true;
  events = FuelConnectorEventTypes;
  skipVersionSelection = true;
  metadata: ConnectorMetadata = {
    image: SOCIAL_ICON,
    install: {
      action: 'Connect',
      description: 'Connect with Google or Email via Privy',
      link: 'https://privy.io',
    },
  };

  private fuelProvider!: FuelProvider;
  private config: SocialConnectorConfig = {} as SocialConnectorConfig;
  private privyAuth: Maybe<PrivyAuthInterface<User, ConnectedWallet>> = null;
  private privyAuthObserver: Maybe<IPrivyAuthObserver<User, ConnectedWallet>> =
    null;
  private observerListeners: ObserverListenersType<User, ConnectedWallet> = {};

  constructor(config: SocialConnectorConfig = {}) {
    super();
    this.customPredicate = config.predicateConfig || null;

    if (HAS_WINDOW) {
      this._configProviders(config);
    }
  }

  /**
   * Set the PrivyAuthObserver for event-driven state updates.
   * This allows granular updates without re-injecting the entire privyAuth payload.
   */
  public setPrivyAuthObserver(
    observer: IPrivyAuthObserver<User, ConnectedWallet> | null,
  ): void {
    this.privyAuthObserver = observer;
    this.setupObserverListeners();
  }

  /**
   * Setup listeners for PrivyAuthObserver events.
   * This allows granular updates without re-injecting the entire payload.
   */
  private setupObserverListeners(): void {
    if (!this.privyAuthObserver) return;

    // Listen for authenticated changes
    const authenticatedListener = (value: boolean) => {
      if (this.privyAuth) {
        this.privyAuth.authenticated = value;
        this.checkAndTriggerAutoReconnect();
      }
    };
    this.privyAuthObserver.on(
      PrivyAuthEventTypes.authenticated,
      authenticatedListener,
    );
    this.observerListeners[PrivyAuthEventTypes.authenticated] =
      authenticatedListener;

    // Listen for ready changes
    const readyListener = (value: boolean) => {
      if (this.privyAuth) {
        this.privyAuth.ready = value;
        this.checkAndTriggerAutoReconnect();
      }
    };
    this.privyAuthObserver.on(PrivyAuthEventTypes.ready, readyListener);
    this.observerListeners[PrivyAuthEventTypes.ready] = readyListener;

    // Listen for user changes
    const userListener = (value?: User) => {
      if (this.privyAuth) {
        this.privyAuth.user = value;
      }
    };
    this.privyAuthObserver.on(PrivyAuthEventTypes.user, userListener);
    this.observerListeners[PrivyAuthEventTypes.user] = userListener;

    // Listen for embeddedWallet changes
    const embeddedWalletListener = (value?: ConnectedWallet) => {
      if (this.privyAuth) {
        this.privyAuth.embeddedWallet = value;
      }
    };
    this.privyAuthObserver.on(
      PrivyAuthEventTypes.embeddedWallet,
      embeddedWalletListener,
    );
    this.observerListeners[PrivyAuthEventTypes.embeddedWallet] =
      embeddedWalletListener;
  }

  /**
   * Check if we should trigger auto-reconnect based on current state.
   * Called whenever authenticated or ready state changes.
   */
  private checkAndTriggerAutoReconnect(): void {
    if (
      !this.privyAuth ||
      !this.privyAuth.authenticated ||
      !this.privyAuth.ready
    ) {
      return;
    }

    this.tryAutoReconnect();
  }

  /**
   * Remove all observer listeners to prevent memory leaks.
   */
  private removeObserverListeners(): void {
    if (!this.privyAuthObserver) return;

    if (this.observerListeners[PrivyAuthEventTypes.authenticated]) {
      this.privyAuthObserver.off(
        PrivyAuthEventTypes.authenticated,
        this.observerListeners[PrivyAuthEventTypes.authenticated],
      );
    }

    if (this.observerListeners[PrivyAuthEventTypes.ready]) {
      this.privyAuthObserver.off(
        PrivyAuthEventTypes.ready,
        this.observerListeners[PrivyAuthEventTypes.ready],
      );
    }

    if (this.observerListeners[PrivyAuthEventTypes.user]) {
      this.privyAuthObserver.off(
        PrivyAuthEventTypes.user,
        this.observerListeners[PrivyAuthEventTypes.user],
      );
    }

    if (this.observerListeners[PrivyAuthEventTypes.embeddedWallet]) {
      this.privyAuthObserver.off(
        PrivyAuthEventTypes.embeddedWallet,
        this.observerListeners[PrivyAuthEventTypes.embeddedWallet],
      );
    }

    this.observerListeners = {};
  }

  /**
   * Updates the Privy auth interface.
   * Useful when the privy context changes (e.g., on re-render).
   * Also handles auto-reconnect when Privy session is restored on page reload.
   *
   * Note: If using PrivyAuthObserver, prefer updating the observer directly
   * instead of calling this method repeatedly.
   */
  public setPrivyAuth(
    privyAuth: PrivyAuthInterface<User, ConnectedWallet>,
  ): void {
    const wasAuthenticated = this.privyAuth?.authenticated ?? false;
    const wasReady = this.privyAuth?.ready ?? false;
    this.privyAuth = privyAuth;

    // Auto-reconnect when Privy state stabilizes:
    // - Just became authenticated (and ready)
    // - Just became ready (and authenticated)
    // This handles both orderings of state changes during hydration
    const justBecameAuthenticated =
      !wasAuthenticated && privyAuth.authenticated;
    const justBecameReady = !wasReady && privyAuth.ready;

    if (
      (justBecameAuthenticated || justBecameReady) &&
      privyAuth.authenticated &&
      privyAuth.ready
    ) {
      this.tryAutoReconnect();
    }
  }

  /**
   * Attempts to auto-reconnect if there's a stored session.
   * Emits connection events to notify the SDK about restored state.
   */
  private tryAutoReconnect(): void {
    if (this.connected) return;

    const storedAccount =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('bako_connector_current_account')
        : null;

    if (storedAccount) {
      this.connected = true;
      this.emit(this.events.connection, true);
      this.emit(this.events.currentAccount, storedAccount);
      this.emit(this.events.accounts, [storedAccount]);
    }
  }

  /**
   * Override accounts() to wait for Privy to be ready before checking stored account.
   * This prevents the race condition where SDK queries accounts() before Privy session is restored.
   */
  public async accounts(): Promise<Array<string>> {
    // If Privy auth is configured, wait for it to be ready
    if (this.privyAuth) {
      await this.waitForPrivyReady(TIMEOUTS.REQUIRE_CONNECTION);
      await this.waitForAuthStateStable();
    }

    // Now check stored account (same as parent class)
    const storedAccount =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('bako_connector_current_account')
        : null;

    return storedAccount ? [storedAccount] : [];
  }

  /**
   * Override isConnected() to check connection without waiting for Privy initialization.
   */
  public async isConnected(): Promise<boolean> {
    // Check if we have stored account AND Privy is authenticated
    const storedAccount =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('bako_connector_current_account')
        : null;

    const hasStoredAccount = !!storedAccount;
    const isPrivyAuthenticated = this.privyAuth?.authenticated ?? false;

    // Return true only if both conditions are met
    return hasStoredAccount && isPrivyAuthenticated;
  }

  /**
   * Send OTP code to email for headless login.
   * Requires sendCode to be provided in privyAuth from useLoginWithEmail hook.
   * Logs out any existing session first to prevent "cannot_link_more_of_type" errors.
   */
  public async sendCode(email: string): Promise<void> {
    if (!this.privyAuth?.sendCode) {
      throw new Error(
        'sendCode not available - ensure useLoginWithEmail hook is configured',
      );
    }

    // Logout any existing session to allow login with different account
    if (this.privyAuth.authenticated) {
      try {
        await this.privyAuth.logout();
        await this.waitForLogoutComplete();
        await new Promise((resolve) =>
          setTimeout(resolve, TIMEOUTS.POST_LOGOUT_DELAY),
        );
      } catch {
        // Logout might fail - continue anyway
      }
    }

    await this.privyAuth.sendCode({ email });
  }

  /**
   * Login with OTP code for headless login.
   * Requires loginWithCode to be provided in privyAuth from useLoginWithEmail hook.
   */
  public async loginWithCode(code: string): Promise<void> {
    if (!this.privyAuth?.loginWithCode) {
      throw new Error(
        'loginWithCode not available - ensure useLoginWithEmail hook is configured',
      );
    }
    await this.privyAuth.loginWithCode({ code });
  }

  protected getWalletAdapter(): PredicateWalletAdapter {
    return new EthereumWalletAdapter();
  }

  protected getPredicateVersions(): Record<string, PredicateVersion> {
    return getPredicateVersions();
  }

  protected async _configProviders(config: SocialConnectorConfig = {}) {
    const network = getProviderUrl(config?.chainId ?? CHAIN_IDS.fuel.mainnet);
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || new FuelProvider(network),
    });
  }

  protected async walletAccounts(): Promise<Array<string>> {
    const address = this._getCurrentEvmAddress();
    return address ? [address] : [];
  }

  protected async getAccountAddress(): Promise<Maybe<string>> {
    return this._getCurrentEvmAddress();
  }

  protected async requireConnection(): Promise<void> {
    if (!this.privyAuth) {
      throw new Error('Privy auth not configured');
    }

    // Wait for Privy to be ready before checking connection
    const isReady = await this.waitForPrivyReady(TIMEOUTS.REQUIRE_CONNECTION);
    if (!isReady) {
      throw new Error('Privy is not ready');
    }

    // Wait for authentication state to stabilize (handles page reload scenario)
    await this.waitForAuthStateStable();

    // Check if user is authenticated
    if (!this.privyAuth.authenticated) {
      throw new Error('User is not authenticated');
    }
  }

  async signMessageCustomCurve(message: string) {
    const signature = await this._signMessage(message);
    return {
      curve: 'secp256k1',
      signature,
    };
  }

  /**
   * Gets the current EVM address from Privy's embedded wallet.
   * Checks both user.wallet and embeddedWallet for the address.
   */
  protected _getCurrentEvmAddress(): Maybe<string> {
    const address =
      this.privyAuth?.user?.wallet?.address ||
      this.privyAuth?.embeddedWallet?.address;
    return address || null;
  }

  /**
   * Checks if there is an active connection, throws if not.
   */
  protected async _requireConnection(): Promise<void> {
    return this.requireConnection();
  }

  /**
   * Gets the configured providers (Fuel and EVM).
   * Note: Privy doesn't expose a standard EIP1193 provider directly,
   * so ethProvider is null. Message signing is done through Privy's API.
   */
  protected async _getProviders(): Promise<ProviderDictionary> {
    if (!this.fuelProvider && this.config.fuelProvider) {
      this.fuelProvider = await this.config.fuelProvider;
    }

    return {
      fuelProvider: this.fuelProvider,
      ethProvider: undefined,
    };
  }

  /**
   * Signs a message using Privy's embedded wallet.
   * First tries using the embedded wallet's provider directly,
   * then falls back to the signMessage API.
   */
  protected async _signMessage(message: string): Promise<string> {
    await this.requireConnection();

    // After requireConnection(), privyAuth is guaranteed to exist and be authenticated
    if (!this.privyAuth) {
      throw new Error('Privy auth not configured');
    }

    const walletAddress = this.privyAuth.user?.wallet?.address;

    // Try using the embedded wallet's provider directly first (more reliable)
    if (this.privyAuth.embeddedWallet) {
      try {
        const provider =
          await this.privyAuth.embeddedWallet.getEthereumProvider();
        const signature = await provider.request({
          method: 'personal_sign',
          params: [message, walletAddress],
        });
        return signature as string;
      } catch {
        // Fall through to signMessage API
      }
    }

    // Fallback to signMessage API (Privy v2 format)
    const result = await this.privyAuth.signMessage(
      { message },
      { address: walletAddress },
    );
    return result.signature;
  }

  /**
   * Generic helper to wait for a condition to be true with timeout.
   * @param condition - Function that returns true when condition is met
   * @param timeoutMs - Maximum time to wait in milliseconds
   * @param intervalMs - Polling interval in milliseconds
   * @returns true if condition was met, false if timeout
   */
  private async waitFor(
    condition: () => boolean,
    timeoutMs: number,
    intervalMs = DEFAULT_POLL_INTERVAL_MS,
  ): Promise<boolean> {
    if (condition()) return true;

    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      if (condition()) return true;
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    return false;
  }

  /**
   * Waits for Privy to be ready with a timeout.
   */
  private async waitForPrivyReady(
    timeoutMs = TIMEOUTS.PRIVY_READY,
  ): Promise<boolean> {
    if (!this.privyAuth) return false;
    return this.waitFor(
      () => this.privyAuth?.ready ?? false,
      timeoutMs,
      FAST_POLL_INTERVAL_MS,
    );
  }

  /**
   * Waits for the embedded wallet to be created after login.
   */
  private async waitForWallet(
    timeoutMs = TIMEOUTS.WALLET_LOAD,
  ): Promise<boolean> {
    if (!this.privyAuth) return false;
    return this.waitFor(
      () =>
        !!(
          this.privyAuth?.user?.wallet?.address ||
          this.privyAuth?.embeddedWallet?.address
        ),
      timeoutMs,
    );
  }

  /**
   * Waits for authentication state to stabilize after Privy ready.
   * This handles the case where Privy iframe has a session but React hasn't hydrated yet.
   */
  private async waitForAuthStateStable(
    timeoutMs = TIMEOUTS.AUTH_STATE_STABLE,
  ): Promise<void> {
    if (!this.privyAuth) return;

    // If already authenticated, no need to wait
    if (this.privyAuth.authenticated) {
      return;
    }

    const startTime = Date.now();
    let lastAuthState = this.privyAuth.authenticated;

    while (Date.now() - startTime < timeoutMs) {
      await new Promise((resolve) =>
        setTimeout(resolve, DEFAULT_POLL_INTERVAL_MS),
      );

      // If auth state changed to true, we found the session
      if (this.privyAuth.authenticated) {
        return;
      }

      // If auth state is stable (hasn't changed), we can stop waiting earlier
      if (lastAuthState === this.privyAuth.authenticated) {
        // Wait at least minimum time before deciding it's stable
        if (Date.now() - startTime > TIMEOUTS.AUTH_STATE_MIN_STABLE) {
          return;
        }
      }
      lastAuthState = this.privyAuth.authenticated;
    }
  }

  /**
   * Waits for logout to complete (authenticated becomes false).
   */
  private async waitForLogoutComplete(
    timeoutMs = TIMEOUTS.LOGOUT,
  ): Promise<boolean> {
    if (!this.privyAuth) return true;
    return this.waitFor(
      () => !this.privyAuth?.authenticated,
      timeoutMs,
      FAST_POLL_INTERVAL_MS,
    );
  }

  /**
   * Waits for authentication to complete after login modal.
   * Checks for wallet address from either user.wallet or embeddedWallet.
   */
  private async waitForAuthentication(
    timeoutMs = TIMEOUTS.AUTHENTICATION,
  ): Promise<boolean> {
    if (!this.privyAuth) return false;

    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      // Check if user cancelled (modal closed without auth)
      if (!this.privyAuth.ready) {
        await new Promise((resolve) =>
          setTimeout(resolve, DEFAULT_POLL_INTERVAL_MS),
        );
        continue;
      }

      // Get wallet address from either source
      const walletAddress =
        this.privyAuth.user?.wallet?.address ||
        this.privyAuth.embeddedWallet?.address;

      // Check if authenticated with wallet
      if (this.privyAuth.authenticated && walletAddress) {
        return true;
      }

      // If authenticated but no wallet yet, keep waiting
      // The React component will update privyAuth when embeddedWallet is ready
      if (this.privyAuth.authenticated) {
        await new Promise((resolve) =>
          setTimeout(resolve, SLOW_POLL_INTERVAL_MS),
        );
        continue;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, DEFAULT_POLL_INTERVAL_MS),
      );
    }

    return false;
  }

  /**
   * Handles the wallet connection logic via Privy login.
   */
  public async _connect(): Promise<boolean> {
    if (!this.privyAuth) {
      throw new Error('Privy auth not configured');
    }

    // Wait for Privy to be ready first
    const isReady = await this.waitForPrivyReady();
    if (!isReady) {
      throw new Error('Privy is not ready');
    }

    // Wait a moment for authentication state to stabilize after Privy ready
    // This handles the case where iframe session exists but React hasn't hydrated yet
    await this.waitForAuthStateStable();

    // Check for wallet address from either source
    const existingWalletAddress =
      this.privyAuth.user?.wallet?.address ||
      this.privyAuth.embeddedWallet?.address;

    // If already authenticated with wallet, return true
    if (this.privyAuth.authenticated && existingWalletAddress) {
      return true;
    }

    // If authenticated but no wallet, wait for it to load (React hydration)
    // Then try to create one if it still doesn't exist
    if (this.privyAuth.authenticated) {
      // Wait for wallet to appear (might just be React hydration delay)
      const walletLoaded = await this.waitForWallet(
        TIMEOUTS.REQUIRE_CONNECTION,
      );
      if (walletLoaded) {
        return true;
      }

      // Wallet didn't load, try to create one manually
      const walletCreated = await this.ensureEmbeddedWallet();
      if (walletCreated) {
        return true;
      }

      // Wallet creation failed - session might be corrupted
      // Logout to start fresh
      await this.privyAuth.logout();
      await this.waitForLogoutComplete();
      await new Promise((resolve) =>
        setTimeout(resolve, TIMEOUTS.POST_LOGOUT_DELAY),
      );
    }

    // Always logout before showing login modal to ensure clean session
    // This prevents "User already has one email account linked" errors
    // when switching between different email accounts
    try {
      await this.privyAuth.logout();
      await this.waitForLogoutComplete();
      await new Promise((resolve) =>
        setTimeout(resolve, TIMEOUTS.POST_LOGOUT_DELAY),
      );
    } catch {
      // Logout might fail if not logged in - that's fine
    }

    // Trigger Privy login modal
    try {
      await this.privyAuth.login({
        loginMethods: ['email'],
      });
    } catch {
      // Login might throw if user closes modal, continue to check auth state
    }

    // Wait for authentication to complete
    const authenticated = await this.waitForAuthentication();
    if (!authenticated) {
      return false;
    }

    // After authentication, ensure embedded wallet exists
    // This is needed because automatic wallet creation doesn't trigger for some login methods
    await this.ensureEmbeddedWallet();

    return true;
  }

  /**
   * Ensures an embedded wallet exists for the authenticated user.
   * Creates one manually if it doesn't exist.
   */
  private async ensureEmbeddedWallet(): Promise<boolean> {
    if (!this.privyAuth) return false;

    // Check if wallet already exists
    const walletAddress =
      this.privyAuth.user?.wallet?.address ||
      this.privyAuth.embeddedWallet?.address;

    if (walletAddress) {
      return true;
    }

    // Try to create wallet manually
    if (this.privyAuth.createWallet) {
      try {
        await this.privyAuth.createWallet();
        // Wait for wallet to be available
        const walletReady = await this.waitForWallet(TIMEOUTS.WALLET_CREATION);
        if (walletReady) {
          return true;
        }
      } catch {
        // Wallet creation failed
      }
    }

    return false;
  }

  /**
   * Handles the wallet disconnection logic via Privy logout.
   * Clears Bako personal wallet data to allow fresh login with different account.
   */
  public async _disconnect(): Promise<boolean> {
    // Clean up observer listeners if any
    this.removeObserverListeners();

    if (!this.privyAuth) {
      return false;
    }

    const wasAuthenticated = this.privyAuth.authenticated;

    try {
      await this.privyAuth.logout();

      // Wait for logout to fully complete
      await this.waitForLogoutComplete();

      // Give Privy iframe time to clear its state
      await new Promise((resolve) =>
        setTimeout(resolve, TIMEOUTS.POST_LOGOUT_DELAY),
      );
    } catch {
      // Logout error - continue with cleanup
    }

    // Clear bako-related localStorage keys to allow fresh login with different account
    if (typeof window !== 'undefined') {
      const keysToRemove = [
        'bako_connector_personal_wallet',
        'bako_connector_session_id',
        'bako_connector_current_account',
      ];
      for (const key of keysToRemove) {
        window.localStorage.removeItem(key);
      }
    }

    return wasAuthenticated;
  }
}
