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

import { stringToHex } from 'viem';
import { HAS_WINDOW, SOCIAL_ICON } from './constants';
import type { PrivyAuthInterface, SocialConnectorConfig } from './types';
import { getPredicateVersions } from './utils';

export class SocialConnector extends PredicateConnector {
  name = 'Social Login';
  installed = true;
  events = FuelConnectorEventTypes;
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

    if (!this.privyAuth.ready) {
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
   */
  protected _getCurrentEvmAddress(): Maybe<string> {
    if (!this.privyAuth?.user?.wallet?.address) {
      return null;
    }
    return this.privyAuth.user.wallet.address;
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
   */
  protected async _signMessage(message: string): Promise<string> {
    if (!this.privyAuth) {
      throw new Error('Privy auth not configured');
    }

    if (!this.privyAuth.authenticated) {
      throw new Error('User is not authenticated');
    }

    const messageToSign = message.startsWith('0x')
      ? message
      : stringToHex(message);

    const result = await this.privyAuth.signMessage(messageToSign);
    return result.signature;
  }

  /**
   * Handles the wallet connection logic via Privy login.
   */
  public async _connect(): Promise<boolean> {
    if (!this.privyAuth) {
      throw new Error('Privy auth not configured');
    }

    // If already authenticated, return true
    if (this.privyAuth.authenticated && this.privyAuth.user?.wallet?.address) {
      return true;
    }

    // Wait for Privy to be ready
    if (!this.privyAuth.ready) {
      throw new Error('Privy is not ready');
    }

    // Trigger Privy login modal
    await this.privyAuth.login({
      loginMethods: ['google', 'email'],
    });

    // Check if authentication was successful
    return (
      this.privyAuth.authenticated && !!this.privyAuth.user?.wallet?.address
    );
  }

  /**
   * Handles the wallet disconnection logic via Privy logout.
   */
  public async _disconnect(): Promise<boolean> {
    if (!this.privyAuth) {
      return false;
    }

    const wasAuthenticated = this.privyAuth.authenticated;

    await this.privyAuth.logout();

    return wasAuthenticated;
  }
}
