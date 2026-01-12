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

import { HAS_WINDOW, SOCIAL_ICON } from './constants';
import type { PrivyAuthInterface, SocialConnectorConfig } from './types';

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
  private privyAuth: Maybe<PrivyAuthInterface> = null;

  constructor(config: SocialConnectorConfig = {}) {
    super();
    this.privyAuth = config.privyAuth || null;
    this.customPredicate = config.predicateConfig || null;

    if (HAS_WINDOW) {
      this._configProviders(config);
    }
  }

  /**
   * Updates the Privy auth interface.
   * Useful when the privy context changes (e.g., on re-render).
   */
  public setPrivyAuth(privyAuth: PrivyAuthInterface): void {
    this.privyAuth = privyAuth;
  }

  /**
   * Send OTP code to email for headless login.
   * Requires sendCode to be provided in privyAuth from useLoginWithEmail hook.
   */
  public async sendCode(email: string): Promise<void> {
    if (!this.privyAuth?.sendCode) {
      throw new Error(
        'sendCode not available - ensure useLoginWithEmail hook is configured',
      );
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
    const isReady = await this.waitForPrivyReady(5000);
    if (!isReady) {
      throw new Error('Privy is not ready');
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
    if (!this.privyAuth) {
      throw new Error('Privy auth not configured');
    }

    if (!this.privyAuth.authenticated) {
      throw new Error('User is not authenticated');
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
    intervalMs = 200,
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
  private async waitForPrivyReady(timeoutMs = 10000): Promise<boolean> {
    if (!this.privyAuth) return false;
    return this.waitFor(() => this.privyAuth?.ready ?? false, timeoutMs, 100);
  }

  /**
   * Waits for the embedded wallet to be created after login.
   */
  private async waitForWallet(timeoutMs = 15000): Promise<boolean> {
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
  private async waitForAuthStateStable(timeoutMs = 2000): Promise<void> {
    if (!this.privyAuth) return;

    // If already authenticated, no need to wait
    if (this.privyAuth.authenticated) {
      return;
    }

    const startTime = Date.now();
    let lastAuthState = this.privyAuth.authenticated;

    while (Date.now() - startTime < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      // If auth state changed to true, we found the session
      if (this.privyAuth.authenticated) {
        return;
      }

      // If auth state is stable (hasn't changed), we can stop waiting earlier
      if (lastAuthState === this.privyAuth.authenticated) {
        // Wait at least 500ms before deciding it's stable
        if (Date.now() - startTime > 500) {
          return;
        }
      }
      lastAuthState = this.privyAuth.authenticated;
    }
  }

  /**
   * Waits for logout to complete (authenticated becomes false).
   */
  private async waitForLogoutComplete(timeoutMs = 5000): Promise<boolean> {
    if (!this.privyAuth) return true;
    return this.waitFor(() => !this.privyAuth?.authenticated, timeoutMs, 100);
  }

  /**
   * Waits for authentication to complete after login modal.
   * Checks for wallet address from either user.wallet or embeddedWallet.
   */
  private async waitForAuthentication(timeoutMs = 60000): Promise<boolean> {
    if (!this.privyAuth) return false;

    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      // Check if user cancelled (modal closed without auth)
      if (!this.privyAuth.ready) {
        await new Promise((resolve) => setTimeout(resolve, 200));
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
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
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
      const walletLoaded = await this.waitForWallet(5000);
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
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Always logout before showing login modal to ensure clean session
    // This prevents "User already has one email account linked" errors
    // when switching between different email accounts
    try {
      await this.privyAuth.logout();
      await this.waitForLogoutComplete();
      await new Promise((resolve) => setTimeout(resolve, 500));
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
        const walletReady = await this.waitForWallet(10000);
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
   */
  public async _disconnect(): Promise<boolean> {
    if (!this.privyAuth) {
      return false;
    }

    const wasAuthenticated = this.privyAuth.authenticated;

    try {
      await this.privyAuth.logout();

      // Wait for logout to fully complete
      await this.waitForLogoutComplete();

      // Give Privy iframe time to clear its state
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch {
      // Logout error - continue with cleanup
    }

    return wasAuthenticated;
  }
}
