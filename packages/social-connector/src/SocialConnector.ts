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
    console.log('[SocialConnector] setPrivyAuth called', {
      authenticated: privyAuth.authenticated,
      userWallet: privyAuth.user?.wallet?.address,
      embeddedWallet: privyAuth.embeddedWallet?.address,
    });
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
    console.log('[SocialConnector] _signMessage called');

    if (!this.privyAuth) {
      console.error('[SocialConnector] Privy auth not configured for signing');
      throw new Error('Privy auth not configured');
    }

    if (!this.privyAuth.authenticated) {
      console.error('[SocialConnector] User not authenticated for signing');
      throw new Error('User is not authenticated');
    }

    const walletAddress = this.privyAuth.user?.wallet?.address;
    console.log('[SocialConnector] Requesting signature from Privy...', {
      message: message,
      authenticated: this.privyAuth.authenticated,
      hasWallet: !!walletAddress,
      hasEmbeddedWallet: !!this.privyAuth.embeddedWallet,
    });

    // Try using the embedded wallet's provider directly first (more reliable)
    if (this.privyAuth.embeddedWallet) {
      try {
        console.log(
          '[SocialConnector] Using embedded wallet provider directly',
        );
        const provider =
          await this.privyAuth.embeddedWallet.getEthereumProvider();
        const signature = await provider.request({
          method: 'personal_sign',
          params: [message, walletAddress],
        });
        console.log(
          '[SocialConnector] Signature received via provider:',
          signature,
        );
        return signature as string;
      } catch (providerError) {
        console.warn(
          '[SocialConnector] Provider signing failed, trying signMessage API:',
          providerError,
        );
        // Fall through to signMessage API
      }
    }

    // Fallback to signMessage API (Privy v2 format)
    try {
      console.log('[SocialConnector] Using signMessage API');
      const result = await this.privyAuth.signMessage(
        { message },
        { address: walletAddress },
      );
      console.log('[SocialConnector] Signature received:', result.signature);
      return result.signature;
    } catch (error) {
      console.error('[SocialConnector] signMessage error:', error);
      throw error;
    }
  }

  /**
   * Waits for Privy to be ready with a timeout.
   */
  private async waitForPrivyReady(timeoutMs = 10000): Promise<boolean> {
    if (!this.privyAuth) return false;
    if (this.privyAuth.ready) return true;

    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      if (this.privyAuth.ready) return true;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return false;
  }

  /**
   * Waits for the embedded wallet to be created after login.
   * Checks both user.wallet and embeddedWallet sources.
   */
  private async waitForWallet(timeoutMs = 15000): Promise<boolean> {
    if (!this.privyAuth) return false;

    const getWalletAddress = () =>
      this.privyAuth?.user?.wallet?.address ||
      this.privyAuth?.embeddedWallet?.address;

    if (getWalletAddress()) return true;

    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      if (getWalletAddress()) return true;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    return false;
  }

  /**
   * Waits for authentication state to stabilize after Privy ready.
   * This handles the case where Privy iframe has a session but React hasn't hydrated yet.
   */
  private async waitForAuthStateStable(timeoutMs = 2000): Promise<void> {
    if (!this.privyAuth) return;

    // If already authenticated, no need to wait
    if (this.privyAuth.authenticated) {
      console.log('[SocialConnector] Already authenticated, no wait needed');
      return;
    }

    console.log('[SocialConnector] Waiting for auth state to stabilize...');
    const startTime = Date.now();
    let lastAuthState = this.privyAuth.authenticated;

    while (Date.now() - startTime < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      // If auth state changed to true, we found the session
      if (this.privyAuth.authenticated) {
        console.log('[SocialConnector] Auth state changed to authenticated');
        return;
      }

      // If auth state is stable (hasn't changed), we can stop waiting earlier
      if (lastAuthState === this.privyAuth.authenticated) {
        // Wait at least 500ms before deciding it's stable
        if (Date.now() - startTime > 500) {
          console.log(
            '[SocialConnector] Auth state stable at:',
            this.privyAuth.authenticated,
          );
          return;
        }
      }
      lastAuthState = this.privyAuth.authenticated;
    }

    console.log(
      '[SocialConnector] Auth state stabilized (timeout):',
      this.privyAuth.authenticated,
    );
  }

  /**
   * Waits for logout to complete (authenticated becomes false).
   */
  private async waitForLogoutComplete(timeoutMs = 5000): Promise<boolean> {
    if (!this.privyAuth) return true;
    if (!this.privyAuth.authenticated) return true;

    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      if (!this.privyAuth.authenticated) {
        console.log('[SocialConnector] Logout complete');
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log('[SocialConnector] Logout timeout, proceeding anyway');
    return false;
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
        console.log(
          '[SocialConnector] Authentication successful:',
          walletAddress,
        );
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

    console.log('[SocialConnector] Authentication timeout');
    return false;
  }

  /**
   * Handles the wallet connection logic via Privy login.
   */
  public async _connect(): Promise<boolean> {
    console.log('[SocialConnector] _connect called');

    if (!this.privyAuth) {
      console.error('[SocialConnector] Privy auth not configured');
      throw new Error('Privy auth not configured');
    }

    // Wait for Privy to be ready first
    console.log('[SocialConnector] Waiting for Privy to be ready...');
    const isReady = await this.waitForPrivyReady();
    if (!isReady) {
      console.error('[SocialConnector] Privy is not ready after timeout');
      throw new Error('Privy is not ready');
    }
    console.log('[SocialConnector] Privy is ready');

    // Wait a moment for authentication state to stabilize after Privy ready
    // This handles the case where iframe session exists but React hasn't hydrated yet
    await this.waitForAuthStateStable();

    // Check for wallet address from either source
    const existingWalletAddress =
      this.privyAuth.user?.wallet?.address ||
      this.privyAuth.embeddedWallet?.address;

    // If already authenticated with wallet, return true
    if (this.privyAuth.authenticated && existingWalletAddress) {
      console.log(
        '[SocialConnector] Already authenticated:',
        existingWalletAddress,
      );
      return true;
    }

    // If authenticated but no wallet, wait for it to load (React hydration)
    // Then try to create one if it still doesn't exist
    if (this.privyAuth.authenticated) {
      console.log(
        '[SocialConnector] Authenticated, waiting for wallet to load...',
      );

      // Wait for wallet to appear (might just be React hydration delay)
      const walletLoaded = await this.waitForWallet(5000);
      if (walletLoaded) {
        const walletAddress =
          this.privyAuth.user?.wallet?.address ||
          this.privyAuth.embeddedWallet?.address;
        console.log('[SocialConnector] Wallet loaded:', walletAddress);
        return true;
      }

      // Wallet didn't load, try to create one manually
      console.log('[SocialConnector] Wallet not found, creating manually...');
      const walletCreated = await this.ensureEmbeddedWallet();
      if (walletCreated) {
        return true;
      }

      // Wallet creation failed - session might be corrupted
      // Logout to start fresh
      console.log(
        '[SocialConnector] Wallet creation failed, clearing corrupted session...',
      );
      await this.privyAuth.logout();
      await this.waitForLogoutComplete();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Always logout before showing login modal to ensure clean session
    // This prevents "User already has one email account linked" errors
    // when switching between different email accounts
    console.log(
      '[SocialConnector] Ensuring clean session before login modal...',
    );
    try {
      await this.privyAuth.logout();
      await this.waitForLogoutComplete();
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (e) {
      // Logout might fail if not logged in - that's fine
      console.log(
        '[SocialConnector] Pre-login logout (expected if not logged in):',
        e,
      );
    }

    // Trigger Privy login modal
    console.log('[SocialConnector] Triggering Privy login...');
    try {
      await this.privyAuth.login({
        loginMethods: ['email'],
      });
    } catch (e) {
      console.log('[SocialConnector] Login modal closed or error:', e);
      // Login might throw if user closes modal, continue to check auth state
    }

    // Wait for authentication to complete
    console.log('[SocialConnector] Waiting for authentication...');
    const authenticated = await this.waitForAuthentication();
    if (!authenticated) {
      console.log('[SocialConnector] User did not complete authentication');
      return false;
    }

    // After authentication, ensure embedded wallet exists
    // This is needed because automatic wallet creation doesn't trigger for some login methods
    await this.ensureEmbeddedWallet();

    console.log('[SocialConnector] _connect successful');
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
      console.log('[SocialConnector] Embedded wallet exists:', walletAddress);
      return true;
    }

    // Try to create wallet manually
    if (this.privyAuth.createWallet) {
      console.log('[SocialConnector] Creating embedded wallet manually...');
      try {
        await this.privyAuth.createWallet();
        // Wait for wallet to be available
        const walletReady = await this.waitForWallet(10000);
        if (walletReady) {
          console.log('[SocialConnector] Embedded wallet created successfully');
          return true;
        }
        console.log(
          '[SocialConnector] Wallet creation completed but not ready',
        );
      } catch (error) {
        console.error(
          '[SocialConnector] Failed to create embedded wallet:',
          error,
        );
      }
    } else {
      console.warn('[SocialConnector] createWallet method not available');
    }

    return false;
  }

  /**
   * Handles the wallet disconnection logic via Privy logout.
   * Clears Bako personal wallet data to allow fresh login with different account.
   */
  public async _disconnect(): Promise<boolean> {
    if (!this.privyAuth) {
      return false;
    }

    const wasAuthenticated = this.privyAuth.authenticated;

    try {
      console.log('[SocialConnector] Logging out from Privy...');
      await this.privyAuth.logout();

      // Wait for logout to fully complete
      await this.waitForLogoutComplete();

      // Give Privy iframe time to clear its state
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('[SocialConnector] Privy logout completed');
    } catch (error) {
      console.error('[SocialConnector] Privy logout error:', error);
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
      console.log('[SocialConnector] Cleared localStorage keys:', keysToRemove);
    }

    return wasAuthenticated;
  }
}
