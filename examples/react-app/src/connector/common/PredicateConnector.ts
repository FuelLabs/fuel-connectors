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
  TypeUser,
  type UsedPredicateVersions,
  Vault,
  Wallet,
  encodeSignature,
  getLatestPredicateVersion,
  getTxIdEncoded,
  legacyConnectorVersion,
} from 'bakosafe';
import { type PredicateWalletAdapter, getFuelPredicateAddresses } from './';
import { SocketClient } from './SocketClient';
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

// Interface para o provider do Bako Safe com método getVaultInfo
interface BakoProviderWithVaultInfo {
  getVaultInfo?: (address: string) => Promise<{
    predicate?: {
      abi: {
        configurables?: Array<{
          name: string;
          concreteTypeId: string;
          offset: number;
        }>;
      };
    };
  }>;
}

// Configuration constants
const BAKO_SERVER_URL = 'https://stg-api.bako.global';
const SELECTED_PREDICATE_KEY = 'fuel_selected_predicate_version';

// Local storage keys for session management
const STORAGE_KEYS = {
  AUTH_PREFIX: 'connector',
  DEFAULT_ACCOUNT: 'default',
  SESSION_ID: 'sessionId',
  ACCOUNT_VALIDATED: 'accountValidated',
  CURRENT_ACCOUNT: 'currentAccount',
  CURRENT_ACCOUNT_CONFIGURABLE: 'currentAccountConfigurable',
} as const;

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
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedVersion = window.localStorage.getItem(
          SELECTED_PREDICATE_KEY,
        );
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

    await bakoProvider.connectDapp(sessionId);

    // Step 4: Get wallet instance and update state
    const wallet = await bakoProvider.wallet();
    const walletAddress = Address.fromB256(wallet.address.toB256()).toString();

    this.emit(this.events.connection, true);
    this.emit(this.events.currentAccount, walletAddress);
    this.emit(this.events.accounts, walletAddress ? [walletAddress] : []);
    this.connected = true;
    const configurable = wallet.getConfigurable();

    localStorage.setItem(STORAGE_KEYS.CURRENT_ACCOUNT, walletAddress);
    localStorage.setItem(
      STORAGE_KEYS.CURRENT_ACCOUNT_CONFIGURABLE,
      JSON.stringify(configurable),
    );

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
      const { fuelProvider } = await this._get_providers();
      const evmAddress = this._get_current_evm_address();

      if (!evmAddress) {
        throw new Error('No connected accounts');
      }

      console.log('address', address);

      // const fuelAddress = new Address(evmAddress).toB256();
      const bakoProvider = await BakoProvider.create(fuelProvider.url, {
        address: address.toLocaleLowerCase(),
        token: `connector${this.getSessionId()}`,
        serverApi: BAKO_SERVER_URL,
      });

      // Verificar compatibilidade dos configurables antes de instanciar o vault
      await this._checkCompatibleConfig(
        address,
        bakoProvider as BakoProviderWithVaultInfo,
      );

      const vault = await Vault.fromAddress(
        new Address(address).toB256(),
        bakoProvider,
      );

      const { tx, hashTxId } = await vault.BakoTransfer(transaction);

      // Encode message according to predicate version requirements
      const messageToSign = getTxIdEncoded(hashTxId, vault.version);
      const signature = await this._sign_message(messageToSign as string);
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
      console.log('Transaction sent:', transactionResponse);

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
    const currentAccount = window.localStorage.getItem(
      STORAGE_KEYS.CURRENT_ACCOUNT,
    );
    return currentAccount ? [currentAccount] : [];
  }

  /**
   * Gets the currently active account.
   */
  public async currentAccount(): Promise<string | null> {
    if (!this.connected) {
      return null;
    }
    return window.localStorage.getItem(STORAGE_KEYS.CURRENT_ACCOUNT) ?? null;
  }

  /**
   * Disconnects the connector and cleans up resources.
   */
  public async disconnect(): Promise<boolean> {
    await this._disconnect();
    this.connected = false;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(SELECTED_PREDICATE_KEY);
        window.localStorage.removeItem(STORAGE_KEYS.CURRENT_ACCOUNT);
        window.localStorage.removeItem(STORAGE_KEYS.DEFAULT_ACCOUNT);
        window?.localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
      }
      // todo: add disconnect dapp
    } catch (error) {
      console.error('Error clearing localStorage during disconnect:', error);
    }

    this.emit(this.events.connection, false);
    this.emit(this.events.currentAccount, null);
    this.emit(this.events.accounts, []);

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
  public async signMessage(_address: string, message: string): Promise<string> {
    return await this._sign_message(message);
  }

  // ============================================================
  // Unimplemented methods (throw errors as expected)
  // ============================================================

  public async addAssets(_assets: Asset[]): Promise<boolean> {
    throw new Error('Method not implemented');
  }

  public async addAsset(_asset: Asset): Promise<boolean> {
    throw new Error('Method not implemented');
  }

  public async assets(): Promise<Array<Asset>> {
    throw new Error('Method not implemented');
  }

  public async addNetwork(_networkUrl: string): Promise<boolean> {
    throw new Error('Method not implemented');
  }

  public async selectNetwork(
    _network: SelectNetworkArguments,
  ): Promise<boolean> {
    throw new Error('Method not implemented');
  }

  public async addAbi(_abiMap: AbiMap): Promise<boolean> {
    throw new Error('Method not implemented');
  }

  public async getAbi(_contractId: string): Promise<JsonAbi> {
    throw new Error('Method not implemented');
  }

  public async hasAbi(_contractId: string): Promise<boolean> {
    throw new Error('Method not implemented');
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

  /**
   * Verifica a compatibilidade dos configurables antes de instanciar o vault.
   * Este método interno é consultado ao instanciar o vault para garantir
   * que os configurables do predicate são compatíveis com o vault.
   *
   * @param address - Endereço do predicate
   * @param bakoProvider - Provider do Bako Safe
   * @throws Error se os configurables não forem compatíveis
   */
  private async _checkCompatibleConfig(
    address: string,
    bakoProvider: BakoProviderWithVaultInfo,
  ): Promise<void> {
    try {
      // Obter informações do predicate do vault
      if (!bakoProvider.getVaultInfo) {
        console.warn(
          '[CONNECTOR] BakoProvider does not support getVaultInfo, skipping compatibility check',
        );
        return;
      }

      const vaultInfo = await bakoProvider.getVaultInfo(address);

      if (!vaultInfo || !vaultInfo.predicate) {
        throw new Error('Vault information not found');
      }

      const predicateAbi = vaultInfo.predicate.abi;

      // Verificar se o predicate tem configurables
      if (
        !predicateAbi.configurables ||
        predicateAbi.configurables.length === 0
      ) {
        console.warn('[CONNECTOR] Predicate has no configurables');
        return;
      }

      // Verificar se temos configuração customizada
      if (this.customPredicate) {
        const customAbi = this.customPredicate.abi;

        // Verificar compatibilidade dos configurables
        const isCompatible = this._validateConfigurablesCompatibility(
          predicateAbi.configurables || [],
          customAbi.configurables || [],
        );

        if (!isCompatible) {
          throw new Error(
            'Predicate configurables are not compatible with the custom predicate configuration',
          );
        }
      }

      // Verificar se os configurables obrigatórios estão presentes
      const requiredConfigurables = ['SIGNER'];
      const predicateConfigurables = (predicateAbi.configurables || []).map(
        (c: { name: string }) => c.name,
      );

      for (const required of requiredConfigurables) {
        if (!predicateConfigurables.includes(required)) {
          throw new Error(
            `Required configurable '${required}' not found in predicate`,
          );
        }
      }

      console.log('[CONNECTOR] Configurables compatibility check passed');
    } catch (error) {
      console.error(
        '[CONNECTOR] Configurables compatibility check failed:',
        error,
      );
      throw new Error(
        `Failed to verify predicate configurables compatibility: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Gets the legacy versions used by the current account and hash predicate.
   * @returns Promise that resolves to the legacy versions with balance informations.
   */
  private async _getLegacyVersionResult(): Promise<UsedPredicateVersions[]> {
    const evmAddress = this._get_current_evm_address();
    const { fuelProvider } = await this._get_providers();
    const configurable = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CURRENT_ACCOUNT_CONFIGURABLE) ?? '{}',
    );
    return legacyConnectorVersion(
      evmAddress ?? '',
      fuelProvider.url,
      configurable?.HASH_PREDICATE,
    );
  }

  /**
   * Valida a compatibilidade entre os configurables do predicate e da configuração customizada.
   *
   * @param predicateConfigurables - Configurables do predicate
   * @param customConfigurables - Configurables da configuração customizada
   * @returns true se compatível, false caso contrário
   */
  private _validateConfigurablesCompatibility(
    predicateConfigurables: readonly {
      name: string;
      concreteTypeId: string;
      offset: number;
    }[],
    customConfigurables: readonly {
      name: string;
      concreteTypeId: string;
      offset: number;
    }[],
  ): boolean {
    // Se não há configuração customizada, considerar compatível
    if (customConfigurables.length === 0) {
      return true;
    }

    // Verificar se todos os configurables customizados existem no predicate
    for (const customConfig of customConfigurables) {
      const predicateConfig = predicateConfigurables.find(
        (p) => p.name === customConfig.name,
      );

      if (!predicateConfig) {
        console.error(
          `[CONNECTOR] Custom configurable '${customConfig.name}' not found in predicate`,
        );
        return false;
      }

      // Verificar se os tipos são compatíveis
      if (predicateConfig.concreteTypeId !== customConfig.concreteTypeId) {
        console.error(
          `[CONNECTOR] Configurable '${customConfig.name}' type mismatch: ` +
            `predicate=${predicateConfig.concreteTypeId}, custom=${customConfig.concreteTypeId}`,
        );
        return false;
      }
    }

    return true;
  }

  private _getLatestPredicateVersion(): string {
    const latestPredicateVersion = getLatestPredicateVersion(Wallet.EVM);
    return latestPredicateVersion.version;
  }

  /**
   * Generates or retrieves a session ID for the current session.
   */
  protected getSessionId(): string {
    let sessionId =
      window?.localStorage.getItem(STORAGE_KEYS.SESSION_ID) ?? null;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      window?.localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
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
   * Emits account change events.
   */
  protected async emitAccountChange(
    _address: string,
    connected = true,
  ): Promise<void> {
    this.emit(this.events.connection, connected);
    this.emit(this.events.currentAccount, this.currentAccount());
    this.emit(this.events.accounts, []);
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

    const connectorConfig = {
      SIGNERS: [evmAddress],
      SIGNATURES_COUNT: 1,
    };

    const vault = new Vault(
      fuelProvider,
      connectorConfig,
      version?.toLowerCase(),
    );

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
    const predicateVersions = this.getPredicateVersionsEntries();
    const latestPredicateVersion = this._getLatestPredicateVersion();

    const legacyVersionResult = await this._getLegacyVersionResult();

    const result: PredicateVersionWithMetadata[] = await Promise.all(
      predicateVersions.map(async ([key, pred]) => {
        const metadata: PredicateVersionWithMetadata = {
          id: key,
          generatedAt: pred.generatedAt,
          isActive: false,
          isSelected:
            key.toLowerCase() === this.selectedPredicateVersion?.toLowerCase(),
          isNewest: key.toLowerCase() === latestPredicateVersion.toLowerCase(),
        };

        if (walletAccount) {
          const predicateAddress = getFuelPredicateAddresses({
            predicate: {
              abi: pred.predicate.abi,
              bin: pred.predicate.bin,
            },
          });

          metadata.accountAddress = predicateAddress;
        }

        try {
          const legacyVersion = legacyVersionResult.find(
            (v) => v.version === key,
          );
          if (legacyVersion?.hasBalance) {
            metadata.isActive = true;
            metadata.balance = legacyVersion.ethBalance.amount;
            metadata.assetId = legacyVersion.ethBalance.assetId;
          }
        } catch (error) {
          console.error(`Failed to check balance for predicate ${key}:`, error);
        }

        return metadata;
      }),
    );

    return result;
  }

  public async setSelectedPredicateVersion(versionId: string): Promise<void> {
    const predicateVersions = this.getPredicateVersions();
    const versionExists = versionId in predicateVersions;

    if (versionExists) {
      this.selectedPredicateVersion = versionId;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(SELECTED_PREDICATE_KEY, versionId);
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
    return this.selectedPredicateVersion;
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
    await this.setupPredicate();
    const address = await this.getAccountAddress();
    if (!address) {
      throw new Error(
        'No account address found after switching predicate version',
      );
    }
    await this.emitAccountChange(address, true);
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
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(SELECTED_PREDICATE_KEY, predicateVersion);
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
