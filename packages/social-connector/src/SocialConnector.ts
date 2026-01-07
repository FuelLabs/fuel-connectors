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
  getProviderUrl,
} from '@fuel-connectors/bako-predicate-connector';

import { HAS_WINDOW, SOCIAL_ICON } from './constants';
import type { PrivyAuthInterface, SocialConnectorConfig } from './types';
import { getPredicateVersions } from './utils';

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

  protected async configProviders(config: SocialConnectorConfig = {}) {
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
   * Configures providers based on connector configuration.
   */
  protected async _configProviders(config: SocialConnectorConfig = {}) {
    return this.configProviders(config);
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
   */
  private async waitForWallet(timeoutMs = 15000): Promise<boolean> {
    if (!this.privyAuth) return false;
    if (this.privyAuth.user?.wallet?.address) return true;

    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      if (this.privyAuth.user?.wallet?.address) return true;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
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

    // If already authenticated with wallet, return true
    if (this.privyAuth.authenticated && this.privyAuth.user?.wallet?.address) {
      console.log(
        '[SocialConnector] Already authenticated:',
        this.privyAuth.user.wallet.address,
      );
      return true;
    }

    // Wait for Privy to be ready
    console.log('[SocialConnector] Waiting for Privy to be ready...');
    const isReady = await this.waitForPrivyReady();
    if (!isReady) {
      console.error('[SocialConnector] Privy is not ready after timeout');
      throw new Error('Privy is not ready');
    }
    console.log('[SocialConnector] Privy is ready');

    // Trigger Privy login modal (this may return before login completes)
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

    console.log('[SocialConnector] _connect successful');
    return true;
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
      console.log('[SocialConnector] Privy logout completed');
    } catch (error) {
      console.error('[SocialConnector] Privy logout error:', error);
    }

    // Clear only the personal wallet key to allow fresh login with different account
    // Other keys (session_id, etc) are managed by PredicateConnector.disconnect()
    if (typeof window !== 'undefined') {
      const keyToRemove = 'bako_connector_personal_wallet';
      window.localStorage.removeItem(keyToRemove);
      console.log('[SocialConnector] Cleared:', keyToRemove);
    }

    return wasAuthenticated;
  }
}
