import {
  type AbiMap,
  Address,
  type Asset,
  type ConnectorMetadata,
  FuelConnector,
  FuelConnectorEventTypes,
  type JsonAbi,
  type Network,
  type SelectNetworkArguments,
  type TransactionRequestLike,
  type TransactionResponse,
  type Version,
} from 'fuels';

import {
  BakoProvider,
  DEFAULT_ASSET_ID,
  TypeUser,
  type UsedPredicateVersions,
  Vault,
  Wallet,
  getAllVersionsDetails,
  getLatestPredicateVersion,
  legacyConnectorVersion,
} from 'bakosafe';
import type { PredicateWalletAdapter } from './';
import { SocketClient } from './SocketClient';
import { StoreManager } from './StoreManager';
import {
  BAKO_SERVER_URL,
  DEFAULT_CONNECTOR_PREDICATE_DESCRIPTION,
  DEFAULT_CONNECTOR_PREDICATE_NAME,
  DEFAULT_VERSION,
  ORIGIN,
  WINDOW,
} from './constants';
import type {
  ApiError,
  BakoPersonalWalletData,
  ConnectorConfig,
  Maybe,
  MaybeAsync,
  PredicateConfig,
  PredicateVersion,
  PredicateVersionWithMetadata,
  ProviderDictionary,
  SignedMessageCustomCurve,
} from './types';

/**
 * Abstract base class for predicate-based wallet connectors.
 * Handles common logic for Bako Safe integration, session management,
 * and provides template methods for wallet-specific implementations.
 */
export abstract class PredicateConnector extends FuelConnector {
  public connected = false;
  public installed = false;
  public external = true;
  public events = FuelConnectorEventTypes;

  protected predicateAddress!: string;
  protected customPredicate: Maybe<PredicateConfig>;
  protected predicateAccount: Maybe<Vault> = null;
  protected subscriptions: Array<() => void> = [];
  protected hasProviderSucceeded = true;
  protected selectedPredicateVersion: Maybe<string> = null;

  protected socketClient: Maybe<SocketClient> = null;

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
    // TODO: Enable socket client when real-time features are needed
    // this.initializeSocketClient();

    if (WINDOW) {
      const savedVersion = StoreManager.get('SELECTED_PREDICATE_KEY');
      if (savedVersion) {
        this.selectedPredicateVersion = savedVersion;
      }
    }
  }

  /**
   * Main connection method that orchestrates the connection flow.
   * Subclasses implement wallet-specific connection logic.
   */
  public async connect(): Promise<boolean> {
    // Always clears previous session when starting a new login.
    if (WINDOW) {
      StoreManager.clear();
    }
    this.connected = false;

    // Step 1: Establish wallet connection (implemented by subclass)
    const walletConnectionSuccessful = await this._connect();
    if (!walletConnectionSuccessful) {
      return false;
    }

    // Step 2: Setup Bako Safe integration
    const { fuelProvider } = await this._getProviders();
    const evmAddress = this._getCurrentEvmAddress();
    if (!evmAddress) {
      throw new Error('EVM address not found');
    }

    const fuelAddress = new Address(evmAddress).toB256();

    // Clear old personal wallet data if address changed
    const existingPersonalWallet = StoreManager.getPersonalWallet();
    if (existingPersonalWallet) {
      const currentFuelAddress = fuelAddress.toLowerCase();
      const storedSigner = this._getSignerFromConfigurable(
        existingPersonalWallet.configurable,
      );
      if (storedSigner && storedSigner.toLowerCase() !== currentFuelAddress) {
        StoreManager.clear();
      }
    }

    // Step 3: Authenticate with Bako Safe
    const challengeCode = await BakoProvider.setup({
      provider: fuelProvider.url,
      address: fuelAddress,
      encoder: TypeUser.EVM,
      serverApi: BAKO_SERVER_URL,
    });

    let challengeSignature: string;

    try {
      challengeSignature = await this._signMessage(challengeCode);
    } catch (_error) {
      console.error('Error signing message: ', _error);
      this.connected = false;

      if (WINDOW) {
        StoreManager.clear();
      }
      throw new Error('Signature rejected. Authentication aborted.');
    }

    if (!challengeSignature) {
      throw new Error('Missing challenge signature. Aborting login.');
    }

    const bakoProvider = await BakoProvider.authenticate(fuelProvider.url, {
      address: fuelAddress,
      challenge: challengeCode,
      encoder: TypeUser.EVM,
      token: challengeSignature,
      serverApi: BAKO_SERVER_URL,
    });

    const sessionId = this.getSessionId();

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
    const evmAddress = this._getCurrentEvmAddress();

    if (!evmAddress) {
      throw new Error('No connected accounts');
    }

    const bakoProvider = await this._createBakoProvider();

    const vault = await Vault.fromAddress(
      new Address(address).toB256(),
      bakoProvider,
    );

    const { tx, hashTxId, encodedTxId } = await vault.BakoTransfer(transaction);
    const signature = await this._signMessage(encodedTxId);
    const encodedSignature = vault.encodeSignature(evmAddress, signature);

    await bakoProvider.signTransaction({
      hash: hashTxId,
      signature: encodedSignature,
    });

    const transactionResponse = await vault.send(tx);

    await transactionResponse.waitForResult();

    return transactionResponse;
  }

  /**
   * Signs a message using the connected wallet.
   * @param message - Message to be signed
   * @returns Promise with the signature
   */
  protected abstract _signMessage(message: string): Promise<string>;

  /**
   * Gets the configured providers (Fuel and EVM).
   * @returns Promise with the providers dictionary
   */
  protected abstract _getProviders(): Promise<ProviderDictionary>;

  /**
   * Gets the current EVM address from the connected wallet.
   * @returns EVM address or null if not connected
   */
  protected abstract _getCurrentEvmAddress(): Maybe<string>;

  /**
   * Checks if there is an active connection, throws if not.
   */
  protected abstract _requireConnection(): MaybeAsync<void>;

  /**
   * Configures the providers based on the connector configuration.
   * @param config - Connector configuration
   */
  protected abstract _configProviders(
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

  /**
   * Health check method to verify provider availability.
   */
  public async ping(): Promise<boolean> {
    try {
      await this._getProviders();
      this.hasProviderSucceeded = true;
      return true;
    } catch {
      this.hasProviderSucceeded = false;
      return false;
    }
  }

  /**
   * Returns connector version information.
   */
  public async version(): Promise<Version> {
    return DEFAULT_VERSION;
  }

  /**
   * Checks if the connector is currently connected.
   */
  public async isConnected(): Promise<boolean> {
    try {
      await this._requireConnection();
      const accounts = await this.accounts();
      return accounts.length > 0;
    } catch {
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
      throw Error('No connected accounts');
    }
    return StoreManager.get('CURRENT_ACCOUNT') ?? null;
  }

  /**
   * Disconnects the connector and cleans up resources.
   * @returns true if disconnection was successful
   */
  public async disconnect(): Promise<boolean> {
    try {
      const sessionId = this.getSessionId();

      // Step 1: Clean up server-side session before clearing local storage
      try {
        const bakoProvider = await this._createBakoProvider();
        await bakoProvider.disconnect(sessionId);
      } catch {
        // Server cleanup might fail if already disconnected, continue with cleanup
      }

      // Step 2: Disconnect wallet and clear wallet-specific state
      await this._disconnect();
    } catch {
      // Silently handle disconnect errors
    } finally {
      // Step 3: Clear all storage data
      if (WINDOW) {
        StoreManager.clear();
      }

      // Reset internal state
      this.predicateAccount = null;
      this.selectedPredicateVersion = null;
    }

    this.emitAccountChange(null, false);

    return true;
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
    const { fuelProvider } = await this._getProviders();
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

    return this._createBakoProviderWithAddress(currentAccount.toLowerCase());
  }

  private async _createBakoProviderWithAddress(
    address: string,
  ): Promise<BakoProvider> {
    const { fuelProvider } = await this._getProviders();

    return BakoProvider.create(fuelProvider.url, {
      address,
      token: `connector${this.getSessionId()}`,
      serverApi: BAKO_SERVER_URL,
    });
  }

  /**
   * Gets the legacy versions used by the current account and hash predicate.
   * @returns Promise that resolves to the legacy versions with balance informations.
   */
  private async _getLegacyVersionResult(): Promise<UsedPredicateVersions[]> {
    const evmAddress = this._getCurrentEvmAddress();
    const { fuelProvider } = await this._getProviders();

    const bakoPersonalWallet = StoreManager.getPersonalWallet();

    // Try to get BakoProvider if user is connected to query root wallet from API
    let bakoProvider: BakoProvider | undefined;
    try {
      bakoProvider = await this._createBakoProvider();
    } catch {
      // User not connected yet, continue without BakoProvider
    }

    return legacyConnectorVersion(
      evmAddress ?? '',
      fuelProvider.url,
      bakoPersonalWallet?.configurable?.HASH_PREDICATE,
      bakoProvider,
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
    const { fuelProvider } = await this._getProviders();
    const evmAddress = this._getCurrentEvmAddress();

    if (!evmAddress) {
      throw new Error('No account address found');
    }

    const bakoPersonalWallet = StoreManager.getPersonalWallet();

    if (!bakoPersonalWallet) {
      throw new Error('No Bako personal wallet found');
    }

    const { configurable, version: _version } = bakoPersonalWallet;

    // If same version as personal wallet, use its configurable
    // Otherwise, determine the correct configurable based on version's walletOrigin
    const signer = new Address(evmAddress).toB256();

    let vault: Vault;

    if (_version === version) {
      vault = new Vault(fuelProvider, configurable, version?.toLowerCase());
    } else {
      const versions = getAllVersionsDetails();
      const versionKey = version?.toLowerCase() ?? '';
      const versionDetails = versions[versionKey];

      // Use same logic as legacyConnectorVersion in bakosafe SDK:
      // If version supports FUEL wallet, use SIGNERS format, otherwise use SIGNER
      if (versionDetails?.walletOrigin?.includes(Wallet.FUEL)) {
        vault = new Vault(
          fuelProvider,
          {
            SIGNERS: [signer],
            SIGNATURES_COUNT: 1,
            // Use the same default as legacyConnectorVersion for consistent addresses
            HASH_PREDICATE:
              bakoPersonalWallet.configurable?.HASH_PREDICATE ??
              DEFAULT_ASSET_ID.assetId,
          },
          version?.toLowerCase(),
        );
      } else {
        vault = new Vault(
          fuelProvider,
          { SIGNER: signer },
          version?.toLowerCase(),
        );
      }
    }

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

    if (!versionExists) {
      throw new Error(`Predicate version ${versionId} not found`);
    }

    this.selectedPredicateVersion = versionId;

    if (WINDOW) {
      StoreManager.set('SELECTED_PREDICATE_KEY', versionId);
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

    if (predicateWithBalance) {
      return predicateWithBalance.version;
    }

    return newestPredicate?.version ?? null;
  }

  public async switchPredicateVersion(versionId: string): Promise<void> {
    await this.setSelectedPredicateVersion(versionId);
    const selectedPredicate = await this.setupPredicate();
    const address = await this.getAccountAddress();
    const selectedPredicateAddress = selectedPredicate.address
      .toString()
      .toLowerCase();

    if (!address) {
      throw new Error(
        'No account address found after switching predicate version',
      );
    }

    const bakoProvider = await this._createBakoProviderWithAddress(
      new Address(this._getCurrentEvmAddress() ?? '').toB256().toLowerCase(),
    );

    await this._ensurePredicateExists(
      bakoProvider,
      selectedPredicate,
      selectedPredicateAddress,
    );

    await bakoProvider.changeAccount(
      this.getSessionId(),
      selectedPredicateAddress ?? '',
    );

    this.emitAccountChange(selectedPredicateAddress, true);
  }

  /**
   * Ensures the predicate exists in the Bako API.
   * If not found, creates it using vault.save().
   */
  private async _ensurePredicateExists(
    provider: BakoProvider,
    vault: Vault,
    predicateAddress: string,
  ): Promise<void> {
    const predicateExists = await this._checkPredicateExists(
      provider,
      predicateAddress,
    );

    if (!predicateExists) {
      await this._createPredicateInApi(provider, vault);
    }
  }

  /**
   * Checks if a predicate exists in the Bako API.
   */
  private async _checkPredicateExists(
    provider: BakoProvider,
    predicateAddress: string,
  ): Promise<boolean> {
    try {
      const predicate = await provider.findPredicateByAddress(predicateAddress);
      return predicate !== null && predicate !== undefined;
    } catch (error) {
      if ((error as ApiError).status === 404) {
        return false;
      }

      return true;
    }
  }

  /**
   * Generates a unique name to create a new predicate.
   *
   * The name follows the pattern: "Predicate #<UUID>"
   * Example: "Predicate #a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6"
   *
   * @returns {string} Unique name for the predicate
   */
  private generateConnectorPredicateName(): string {
    const uniqueId = crypto.randomUUID();
    return `${DEFAULT_CONNECTOR_PREDICATE_NAME} #${uniqueId}`;
  }

  /**
   * Creates a predicate in the Bako API with a unique generated name.
   *
   * @param provider - BakoProvider instance for API communication
   * @param vault - Vault instance containing the predicate configuration
   * @throws Error if creation fails
   */
  private async _createPredicateInApi(
    provider: BakoProvider,
    vault: Vault,
  ): Promise<void> {
    const predicateName = this.generateConnectorPredicateName();
    const vaultToSave = new Vault(
      provider,
      vault.configurable,
      vault.predicateVersion,
    );

    await vaultToSave.save({
      name: predicateName,
      description: DEFAULT_CONNECTOR_PREDICATE_DESCRIPTION,
    });
  }

  /**
   * Extracts the signer address from a configurable object.
   * Handles both SIGNER (single owner) and SIGNERS (multisig) formats.
   */
  private _getSignerFromConfigurable(
    configurable: BakoPersonalWalletData['configurable'],
  ): string | null {
    // Check for SIGNER format (single owner / connector)
    const signer = (configurable as { SIGNER?: string }).SIGNER;
    if (signer && typeof signer === 'string') {
      return signer;
    }

    // Check for SIGNERS format (multisig / fuel wallet)
    const signers = (configurable as { SIGNERS?: string[] }).SIGNERS;
    if (Array.isArray(signers) && signers.length > 0) {
      return signers[0] ?? null;
    }

    return null;
  }

  protected async getNewestPredicate(): Promise<Maybe<Vault>> {
    const predicateVersions = this.getPredicateVersionsEntries();
    if (predicateVersions.length === 0) return null;
    const latestPredicateVersion = this._getLatestPredicateVersion();

    try {
      const vault = await this.getBakoSafePredicate(latestPredicateVersion);
      return vault;
    } catch {
      return null;
    }
  }

  protected async setupPredicate(): Promise<Vault> {
    // Priority 1: Use explicitly selected predicate version
    const selectedVersion = this.getSelectedPredicateVersion();
    if (selectedVersion) {
      return this._setupPredicateByVersion(selectedVersion);
    }

    // Priority 2: Use custom predicate if configured
    if (this.customPredicate?.abi && this.customPredicate?.bin) {
      const vault = await this.getBakoSafePredicate();
      this.predicateAddress = 'custom';
      this.predicateAccount = vault;
      return vault;
    }

    // Priority 3: Use predicate with balance or newest available
    const predicate = await this._getDefaultPredicate();

    await this._persistPredicateSelection(predicate);

    return predicate;
  }

  private async _setupPredicateByVersion(version: string): Promise<Vault> {
    const predicate = await this.getBakoSafePredicate(version);
    this.predicateAddress = version;
    this.predicateAccount = predicate;
    return predicate;
  }

  private async _getDefaultPredicate(): Promise<Vault> {
    const predicate =
      (await this.getCurrentUserPredicate()) ??
      (await this.getNewestPredicate());

    if (!predicate) {
      throw new Error('No predicate found');
    }

    return predicate;
  }

  private async _persistPredicateSelection(predicate: Vault): Promise<void> {
    const predicateVersion = predicate.version;

    this.predicateAddress = predicateVersion;
    this.predicateAccount = predicate;
    this.selectedPredicateVersion = predicateVersion;

    if (WINDOW) {
      const bakoProvider = await this._createBakoProvider();

      StoreManager.set('SELECTED_PREDICATE_KEY', predicateVersion);
      await bakoProvider.changeAccount(
        this.getSessionId(),
        predicate.address.toString(),
      );
      StoreManager.set('CURRENT_ACCOUNT', predicate.address.toString());
      this.emitAccountChange(predicate.address.toString(), true);
    }
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
