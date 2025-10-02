import {
  type AbiMap,
  Address,
  type Asset,
  type ConnectorMetadata,
  FuelConnector,
  FuelConnectorEventTypes,
  type HashableMessage,
  type JsonAbi,
  type Network,
  type SelectNetworkArguments,
  type TransactionRequestLike,
  type TransactionResponse,
  type Version,
} from 'fuels';

import {
  BakoProvider,
  TypeUser,
  type UsedPredicateVersions,
  Vault,
  Wallet,
  encodeSignature,
  getLatestPredicateVersion,
  legacyConnectorVersion,
} from 'bakosafe';
import { ORIGIN, type PredicateWalletAdapter, WINDOW } from './';
import { SocketClient } from './SocketClient';
import { StoreManager } from './StoreManager';
import type {
  ConnectorConfig,
  Maybe,
  MaybeAsync,
  PredicateConfig,
  PredicateVersion,
  PredicateVersionWithMetadata,
  ProviderDictionary,
  SignedMessageCustomCurve,
} from './types';

// Configuration constants
const BAKO_SERVER_URL = 'https://stg-api.bako.global';
// const BAKO_SERVER_URL = 'http://localhost:3333';

/**
 * Abstract base class for predicate-based wallet connectors.
 * Handles common logic for Bako Safe integration, session management,
 * and provides template methods for wallet-specific implementations.
 */
export abstract class PredicateConnector extends FuelConnector {
  // Connection state
  public connected = false;
  public installed = false;
  public external = true;
  public events = FuelConnectorEventTypes;

  // Protected properties for internal state management
  protected predicateAddress!: string;
  protected customPredicate: Maybe<PredicateConfig>;
  protected predicateAccount: Maybe<Vault> = null;
  protected subscriptions: Array<() => void> = [];
  protected hasProviderSucceeded = true;
  protected selectedPredicateVersion: Maybe<string> = null;

  // Socket client for real-time communication with Bako Safe
  protected socketClient: Maybe<SocketClient> = null;

  // Abstract properties that subclasses must implement
  public abstract name: string;
  public abstract metadata: ConnectorMetadata;

  protected abstract getWalletAdapter(): PredicateWalletAdapter;
  protected abstract getPredicateVersions(): Record<string, PredicateVersion>;

  /**
   * Gets predicate versions as entries array for easier iteration.
   * @returns Array of [key(version), predicate] tuples
   */
  protected getPredicateVersionsEntries(): Array<[string, PredicateVersion]> {
    return Object.entries(this.getPredicateVersions());
  }
  protected abstract getAccountAddress(): MaybeAsync<Maybe<string>>;
  protected abstract requireConnection(): MaybeAsync<void>;
  protected abstract walletAccounts(): Promise<Array<string>>;
  abstract signMessageCustomCurve(
    _message: string,
  ): Promise<SignedMessageCustomCurve>;

  constructor() {
    super();
    this.initializeSocketClient();

    try {
      if (WINDOW) {
        const savedVersion = StoreManager.get('SELECTED_PREDICATE_KEY');
        if (savedVersion) {
          this.selectedPredicateVersion = savedVersion;
        }
      }
    } catch (error) {
      console.error('Failed to load saved predicate version:', error);
    }
  }

  /**
   * Main connection method that orchestrates the connection flow.
   * Subclasses implement wallet-specific connection logic.
   */
  public async connect(): Promise<boolean> {
    // Step 1: Establish wallet connection (implemented by subclass)
    const walletConnectionSuccessful = await this._connect();
    if (!walletConnectionSuccessful) {
      return false;
    }

    // Step 2: Setup Bako Safe integration
    const { fuelProvider } = await this._get_providers();
    const evmAddress = this._get_current_evm_address();
    if (!evmAddress) {
      throw new Error('EVM address not found');
    }

    const fuelAddress = new Address(evmAddress).toB256();

    // Step 3: Authenticate with Bako Safe
    const challengeCode = await BakoProvider.setup({
      provider: fuelProvider.url,
      address: fuelAddress,
      encoder: TypeUser.EVM,
      serverApi: BAKO_SERVER_URL,
    });

    const challengeSignature = await this._sign_message(challengeCode);
    const sessionId = this.getSessionId();

    const bakoProvider = await BakoProvider.authenticate(fuelProvider.url, {
      address: fuelAddress,
      challenge: challengeCode,
      encoder: TypeUser.EVM,
      token: challengeSignature,
      serverApi: BAKO_SERVER_URL,
    });

    await bakoProvider.connectDapp(sessionId, ORIGIN);

    // Step 4: Get wallet instance and update state
    const wallet = await bakoProvider.wallet();
    const walletAddress = new Address(wallet.address.toB256()).toString();

    // Store Bako personal wallet data for predicate operations
    StoreManager.setPersonalWallet({
      address: wallet.address.toB256(),
      configurable: wallet.getConfigurable(),
      version: wallet.version,
    });

    this.emitAccountChange(walletAddress);

    return true;
  }

  /**
   * Sends a transaction through the predicate system.
   * Handles Bako Safe integration and signature requirements.
   */
  public async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<TransactionResponse> {
    try {
      const evmAddress = this._get_current_evm_address();

      if (!evmAddress) {
        throw new Error('No connected accounts');
      }

      const bakoProvider = await this._createBakoProvider();

      const vault = await Vault.fromAddress(
        new Address(address).toB256(),
        bakoProvider,
      );

      const { tx, hashTxId, encodedTxId } =
        await vault.BakoTransfer(transaction);
      const signature = await this._sign_message(encodedTxId);
      const encodedSignature = encodeSignature(
        evmAddress,
        signature,
        vault.version,
      );

      await bakoProvider.signTransaction({
        hash: hashTxId,
        signature: encodedSignature,
      });

      const transactionResponse = await vault.send(tx);

      await transactionResponse.waitForResult();

      return transactionResponse;
    } catch (error) {
      console.error('[CONNECTOR] Transaction error:', error);
      throw error;
    }
  }

  // ============================================================
  // Abstract methods to be implemented by subclasses
  // ============================================================

  /**
   * Signs a message using the connected wallet.
   * @param message - Message to be signed
   * @returns Promise with the signature
   */
  protected abstract _sign_message(message: string): Promise<string>;

  /**
   * Gets the configured providers (Fuel and EVM).
   * @returns Promise with the providers dictionary
   */
  protected abstract _get_providers(): Promise<ProviderDictionary>;

  /**
   * Gets the current EVM address from the connected wallet.
   * @returns EVM address or null if not connected
   */
  protected abstract _get_current_evm_address(): Maybe<string>;

  /**
   * Checks if there is an active connection, throws if not.
   */
  protected abstract _require_connection(): MaybeAsync<void>;

  /**
   * Configures the providers based on the connector configuration.
   * @param config - Connector configuration
   */
  protected abstract _config_providers(
    config: ConnectorConfig,
  ): MaybeAsync<void>;

  /**
   * Handles the wallet connection logic.
   * Called by connect() before executing any Bako Safe logic.
   */
  protected abstract _connect(): Promise<boolean>;

  /**
   * Handles the wallet disconnection logic.
   * Called by the disconnect() method.
   */
  protected abstract _disconnect(): Promise<boolean>;

  // ============================================================
  // Base methods implemented (can be overridden if needed)
  // ============================================================

  /**
   * Health check method to verify provider availability.
   */
  public async ping(): Promise<boolean> {
    try {
      await this._get_providers();
      this.hasProviderSucceeded = true;
      return true;
    } catch (_error) {
      this.hasProviderSucceeded = false;
      return false;
    }
  }

  /**
   * Returns connector version information.
   */
  public async version(): Promise<Version> {
    return { app: '0.0.0', network: '0.0.0' };
  }

  /**
   * Checks if the connector is currently connected.
   */
  public async isConnected(): Promise<boolean> {
    try {
      await this._require_connection();
      const accounts = await this.accounts();
      return accounts.length > 0;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Gets all available accounts.
   */
  public async accounts(): Promise<Array<string>> {
    const currentAccount = StoreManager.get('CURRENT_ACCOUNT');
    return currentAccount ? [currentAccount] : [];
  }

  /**
   * Gets the currently active account.
   */
  public async currentAccount(): Promise<string | null> {
    if (!this.connected) {
      return null;
    }
    return StoreManager.get('CURRENT_ACCOUNT') ?? null;
  }

  /**
   * Disconnects the connector and cleans up resources.
   */
  public async disconnect(): Promise<boolean> {
    await this._disconnect();
    this.connected = false;

    try {
      if (WINDOW) {
        StoreManager.remove('SELECTED_PREDICATE_KEY');
        StoreManager.remove('CURRENT_ACCOUNT');
        StoreManager.remove('SESSION_ID');
      }
      // todo: add disconnect dapp
      const bakoProvider = await this._createBakoProvider();
      await bakoProvider.disconnect(this.getSessionId());
    } catch (error) {
      console.error('Error clearing localStorage during disconnect:', error);
    }

    this.emitAccountChange();

    return false;
  }

  /**
   * Gets available networks.
   */
  public async networks(): Promise<Network[]> {
    return [await this.currentNetwork()];
  }

  /**
   * Gets the current network information.
   */
  public async currentNetwork(): Promise<Network> {
    const { fuelProvider } = await this._get_providers();
    return {
      url: fuelProvider.url,
      chainId: await fuelProvider.getChainId(),
    };
  }

  /**
   * Signs a message using the connected wallet.
   */
  public async signMessage(
    _address: string,
    _message: string,
  ): Promise<string> {
    throw new Error('A predicate account cannot sign messages');
  }

  // ============================================================
  // Unimplemented methods (throw errors as expected)
  // ============================================================

  public async addAssets(_assets: Asset[]): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async addAsset(_asset: Asset): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async assets(): Promise<Array<Asset>> {
    return [];
  }

  public async addNetwork(_networkUrl: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async selectNetwork(
    _network: SelectNetworkArguments,
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async addAbi(_abiMap: AbiMap): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async getAbi(_contractId: string): Promise<JsonAbi> {
    throw new Error('Cannot get contractId ABI for a predicate');
  }

  public async hasAbi(_contractId: string): Promise<boolean> {
    throw new Error('A predicate account cannot have an ABI');
  }

  // ============================================================
  // Private helper methods
  // ============================================================

  /**
   * Initializes the socket client for real-time communication.
   */
  private initializeSocketClient(): void {
    this.socketClient = SocketClient.create({
      sessionId: this.getSessionId(),
      events: this,
    });
  }

  private async _createBakoProvider(): Promise<BakoProvider> {
    const currentAccount = await this.currentAccount();

    if (!currentAccount) {
      throw new Error('No account address found');
    }

    const { fuelProvider } = await this._get_providers();
    return BakoProvider.create(fuelProvider.url, {
      address: currentAccount.toLowerCase(),
      token: `connector${this.getSessionId()}`,
      serverApi: BAKO_SERVER_URL,
    });
  }

  /**
   * Gets the legacy versions used by the current account and hash predicate.
   * @returns Promise that resolves to the legacy versions with balance informations.
   */
  private async _getLegacyVersionResult(): Promise<UsedPredicateVersions[]> {
    const evmAddress = this._get_current_evm_address();
    const { fuelProvider } = await this._get_providers();

    const bakoPersonalWallet = StoreManager.getPersonalWallet();

    return legacyConnectorVersion(
      evmAddress ?? '',
      fuelProvider.url,
      bakoPersonalWallet?.configurable.HASH_PREDICATE,
    );
  }

  private _getLatestPredicateVersion(): string {
    const latestPredicateVersion = getLatestPredicateVersion(Wallet.EVM);
    return latestPredicateVersion.version;
  }

  /**
   * Generates or retrieves a session ID for the current session.
   */
  protected getSessionId(): string {
    let sessionId = StoreManager.get('SESSION_ID') ?? null;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      StoreManager.set('SESSION_ID', sessionId);
    }
    return sessionId;
  }

  /**
   * Emits a custom event through the socket client.
   */
  protected emitCustomEvent(event: string, data: unknown): void {
    if (!this.socketClient) {
      throw new Error('Socket client is not initialized');
    }
    this.socketClient.server.emit(event, data);
  }

  /**
   * Emits account change events for predicate operations.
   * This method is specifically for when switching between predicate versions.
   */
  protected emitAccountChange(
    address: string | null = null,
    connected = true,
  ): void {
    StoreManager.set('CURRENT_ACCOUNT', address ?? '');

    this.emit(this.events.connection, connected);
    this.emit(this.events.currentAccount, address);
    this.emit(this.events.accounts, address ? [address] : []);
    this.connected = connected;
  }

  /**
   * Creates a BakoSafe Vault instance using the current account and provider.
   *
   * @returns Promise<Vault> - The initialized Vault instance
   */
  public async getBakoSafePredicate(version?: string): Promise<Vault> {
    const { fuelProvider } = await this._get_providers();
    const evmAddress = this._get_current_evm_address();

    if (!evmAddress) {
      throw new Error('No account address found');
    }

    const bakoPersonalWallet = StoreManager.getPersonalWallet();

    if (!bakoPersonalWallet) {
      throw new Error('No Bako personal wallet found');
    }

    const { configurable, version: _version } = bakoPersonalWallet;

    const connectorConfig =
      _version === version
        ? configurable
        : {
            SIGNER: new Address(evmAddress).toB256(),
          };

    const vault = new Vault(
      fuelProvider,
      connectorConfig,
      version?.toLowerCase(),
    );

    this.emitAccountChange(vault.address.toString());

    return vault;
  }

  /**
   * Gets all available predicate versions.
   * @returns Array of predicate versions
   */
  public async getAvailablePredicateVersions(): Promise<
    Array<{
      id: string;
      generatedAt: number;
    }>
  > {
    const predicateVersions = this.getPredicateVersionsEntries();
    return predicateVersions.map(([key, pred]) => ({
      id: key,
      generatedAt: pred.generatedAt,
    }));
  }

  /**
   * Get all predicate versions including metadata
   * @returns Promise that resolves to the array of predicate versions with complete metadata
   */
  public async getAllPredicateVersionsWithMetadata(): Promise<
    PredicateVersionWithMetadata[]
  > {
    const walletAccount = await this.getAccountAddress();
    const latestPredicateVersion = this._getLatestPredicateVersion();
    const legacyVersionResult = await this._getLegacyVersionResult();

    const result: PredicateVersionWithMetadata[] = legacyVersionResult.map(
      (v) => {
        return {
          id: v.version,
          generatedAt: v.details.versionTime,
          isActive: v.hasBalance,
          balance: v.ethBalance.amount,
          isSelected: v.version === this.selectedPredicateVersion,
          isNewest: v.version === latestPredicateVersion,
          ...(walletAccount && {
            accountAddress: new Address(v.predicateAddress).toString(),
          }),
        };
      },
    );
    return result;
  }

  public async setSelectedPredicateVersion(versionId: string): Promise<void> {
    const predicateVersions = this.getPredicateVersions();
    const versionExists = versionId in predicateVersions;

    if (versionExists) {
      this.selectedPredicateVersion = versionId;
      try {
        if (WINDOW) {
          StoreManager.set('SELECTED_PREDICATE_KEY', versionId);
        }
      } catch (error) {
        console.error(
          'Failed to save predicate version to localStorage:',
          error,
        );
      }
    } else {
      throw new Error(`Predicate version ${versionId} not found`);
    }
  }

  public getSelectedPredicateVersion(): Maybe<string> {
    return (
      StoreManager.get('SELECTED_PREDICATE_KEY') ??
      this.selectedPredicateVersion
    );
  }

  protected async getCurrentUserPredicate(): Promise<Maybe<Vault>> {
    const legacyVersionResult = await this._getLegacyVersionResult();
    const predicateWithBalance = legacyVersionResult.find((v) => v.hasBalance);

    if (predicateWithBalance) {
      const vault = await this.getBakoSafePredicate(
        predicateWithBalance.version,
      );
      return vault;
    }

    return null;
  }

  public async getSmartDefaultPredicateVersion(): Promise<Maybe<string>> {
    const newestPredicate = await this.getNewestPredicate();
    const predicateWithBalance = await this.getCurrentUserPredicate();

    try {
      if (predicateWithBalance) {
        return predicateWithBalance.version;
      }
      return newestPredicate?.version ?? null;
    } catch (error) {
      console.error(
        'Error determining smart default predicate version:',
        error,
      );

      return newestPredicate?.version ?? null;
    }
  }

  public async switchPredicateVersion(versionId: string): Promise<void> {
    await this.setSelectedPredicateVersion(versionId);
    const selectedPredicate = await this.setupPredicate();
    const address = await this.getAccountAddress();
    const bakoProvider = await this._createBakoProvider();
    const selectedPredicateAddress = selectedPredicate.address
      .toString()
      .toLowerCase();

    if (!address) {
      throw new Error(
        'No account address found after switching predicate version',
      );
    }
    await bakoProvider.changeAccount(
      this.getSessionId(),
      selectedPredicateAddress ?? '',
    );
    this.emitAccountChange(selectedPredicateAddress, true);
  }

  protected async getNewestPredicate(): Promise<Maybe<Vault>> {
    const predicateVersions = this.getPredicateVersionsEntries();
    if (predicateVersions.length === 0) return null;
    const latestPredicateVersion = this._getLatestPredicateVersion();

    try {
      const vault = await this.getBakoSafePredicate(latestPredicateVersion);
      return vault;
    } catch (error) {
      console.error('Error creating newest predicate vault:', error);
      return null;
    }
  }

  protected async setupPredicate(): Promise<Vault> {
    const bakoProvider = await this._createBakoProvider();
    const selectedPredicateVersion = this.getSelectedPredicateVersion();

    if (selectedPredicateVersion) {
      const selectedPredicate = await this.getBakoSafePredicate(
        selectedPredicateVersion,
      );
      if (selectedPredicate) {
        this.predicateAddress = selectedPredicateVersion;
        this.predicateAccount = selectedPredicate;
        return selectedPredicate;
      }
    }

    if (this.customPredicate?.abi && this.customPredicate?.bin) {
      const vault = await this.getBakoSafePredicate();
      this.predicateAddress = 'custom';
      this.predicateAccount = vault;
      return vault;
    }

    if (this.selectedPredicateVersion) {
      const selectedPredicate = await this.getBakoSafePredicate();
      if (selectedPredicate) {
        this.predicateAddress = this.selectedPredicateVersion;
        this.predicateAccount = selectedPredicate;
        return this.predicateAccount;
      }
    }

    const predicate =
      (await this.getCurrentUserPredicate()) ??
      (await this.getNewestPredicate());
    if (!predicate) throw new Error('No predicate found');

    const predicateVersion = predicate.version;

    this.predicateAddress = predicateVersion;
    this.predicateAccount = predicate;
    this.selectedPredicateVersion = predicateVersion;

    try {
      if (WINDOW) {
        StoreManager.set('SELECTED_PREDICATE_KEY', predicateVersion);
        await bakoProvider.changeAccount(
          this.getSessionId(),
          predicate.address.toString(),
        );
        StoreManager.set('CURRENT_ACCOUNT', predicate.address.toString());
        this.emitAccountChange(predicate.address.toString(), true);
      }
    } catch (error) {
      console.error(
        'Failed to save auto-selected predicate version to localStorage:',
        error,
      );
    }

    return this.predicateAccount;
  }

  /**
   * Subscribes to events.
   */
  protected subscribe(listener: () => void) {
    this.subscriptions.push(listener);
  }

  /**
   * Clears all active subscriptions.
   */
  public clearSubscriptions() {
    if (!this.subscriptions) {
      return;
    }
    this.subscriptions.forEach((listener) => listener());
    this.subscriptions = [];
  }
}
