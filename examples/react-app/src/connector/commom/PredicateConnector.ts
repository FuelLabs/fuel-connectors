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

import { hexToBytes } from '@ethereumjs/util';
import { hexlify, splitSignature } from '@ethersproject/bytes';
import {
  BakoProvider,
  SignatureType,
  TypeUser,
  Vault,
  bakoCoder,
} from 'bakosafe';
import { stringToHex } from 'viem';
import { SocketClient } from './socketClient';
import type {
  ConnectorConfig,
  Maybe,
  MaybeAsync,
  PredicateConfig,
  ProviderDictionary,
} from './types';

const BAKO_SERVER_URL = 'http://localhost:3333';
const SELECTED_PREDICATE_KEY = 'fuel_selected_predicate_version';

// send a connectDapp request with an authenticated (signed session) to link the sessionId with the address
// when switching accounts, it's also necessary to disconnect
const CONNECTOR = {
  AUTH_PREFIX: 'connector',
  DEFAULT_ACCOUNT: 'default',
  SESSION_ID: 'sessionId',
  ACCOUNT_VALIDATED: 'accountValidated',
  CURRENT_ACCOUNT: 'currentAccount',
};

export abstract class PredicateConnector extends FuelConnector {
  public connected = false;
  public installed = false;
  external = true;
  public events = FuelConnectorEventTypes;
  protected predicateAddress!: string;
  protected customPredicate: Maybe<PredicateConfig>;
  protected subscriptions: Array<() => void> = [];
  protected hasProviderSucceeded = true;

  // events are handled by the event emitter: socket receives, filters and forwards them
  // to emit an event, you must use the socket (predicateClass.emitCustomEvent)
  protected socketClient: Maybe<SocketClient> = null;

  public abstract name: string;
  public abstract metadata: ConnectorMetadata;

  public async connect(): Promise<boolean> {
    const subclassConectionState = await this._connect();
    if (!subclassConectionState) {
      return false;
    }

    const { fuelProvider } = await this._get_providers();
    const _account = this._get_current_evm_address();
    if (!_account) {
      throw new Error('EVM address not found');
    }

    const account = new Address(_account).toB256();
    console.log('Connecting with account:', account);

    const code = await BakoProvider.setup({
      provider: fuelProvider.url,
      address: account,
      encoder: TypeUser.EVM,
      serverApi: BAKO_SERVER_URL,
    });

    const signature = await this._sign_message(code);
    const sessionId = this.getSessionId();

    const provider = await BakoProvider.authenticate(fuelProvider.url, {
      address: account,
      challenge: code,
      encoder: TypeUser.EVM,
      token: signature,
      serverApi: BAKO_SERVER_URL,
    });

    await provider.connectDapp(sessionId);

    const wallet = await provider.wallet();

    this.emit(this.events.connection, true);
    this.emit(this.events.currentAccount, wallet.address);
    this.emit(this.events.accounts, wallet.address ? [wallet.address] : []);
    this.connected = true;

    localStorage.setItem(CONNECTOR.CURRENT_ACCOUNT, wallet.address.toB256());

    return true;
  }

  public async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<TransactionResponse> {
    try {
      const { fuelProvider } = await this._get_providers();

      const a = this._get_current_evm_address();
      if (!a) throw new Error('No connected accounts');
      const _address = new Address(a).toB256();
      const bakoProvider = await BakoProvider.create(fuelProvider.url, {
        address: _address,
        token: `connector${this.getSessionId()}`,
      });

      const vault = await Vault.fromAddress(
        new Address(address).toB256(),
        bakoProvider,
      );
      const { tx, hashTxId } = await vault.BakoTransfer(transaction);

      // todo: adicione um pre-coder aqui para formatar a mensagem antes de ser assinada
      // const message = `0x${hashTxId}`;
      const message = stringToHex(hashTxId);

      // chamada para a sub implementar assinatura
      const signature = await this._sign_message(message);

      // todo: chame o coder da bako, use o correto para o tipo da carteira (versoes antigas: CONN)
      const compactSignature = splitSignature(hexToBytes(signature)).compact;

      await bakoProvider.signTransaction({
        hash: hashTxId,
        signature: compactSignature,
      });

      const _a = await vault.send(tx);
      console.log(_a);

      await _a.waitForResult();

      return _a;
    } catch (e) {
      console.error('[CONNECTOR]TRANSACTION ERROR', e);
      throw e;
    }
  }

  // ============================================================
  // Abstract methods to be implemented by subclasses
  // ============================================================

  /**
   * Signs a message using the connected wallet
   * @param message - Message to be signed
   * @returns Promise with the signature
   */
  protected abstract _sign_message(message: string): Promise<string>;

  /**
   * Gets the configured providers (Fuel and EVM)
   * @returns Promise with the providers
   */
  protected abstract _get_providers(): Promise<ProviderDictionary>;

  /**
   * Gets the current EVM address from the connected wallet
   * @returns EVM address or null if not connected
   */
  protected abstract _get_current_evm_address(): Maybe<string>;

  /**
   * Checks if there is an active connection, throws if not
   */
  protected abstract _require_connection(): MaybeAsync<void>;

  /**
   * Configures the providers based on the connector configuration
   * @param config - Connector configuration
   */
  protected abstract _config_providers(
    config: ConnectorConfig,
  ): MaybeAsync<void>;

  /**
   * Handles the wallet connection logic
   * Called by connect() before executing any Bako logic
   */
  protected abstract _connect(): Promise<boolean>;

  /**
   * Handles the wallet disconnection logic
   * Called by the disconnect() method
   */
  protected abstract _disconnect(): Promise<boolean>;

  // ============================================================
  // Base methods implemented (can be overridden if needed)
  // ============================================================

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

  public async version(): Promise<Version> {
    return { app: '0.0.0', network: '0.0.0' };
  }

  public async isConnected(): Promise<boolean> {
    try {
      await this._require_connection();
      const accounts = await this.accounts();
      return accounts.length > 0;
    } catch (_error) {
      return false;
    }
  }

  public async accounts(): Promise<Array<string>> {
    const currentAccount = window.localStorage.getItem(
      CONNECTOR.CURRENT_ACCOUNT,
    );
    return currentAccount ? [currentAccount] : [];
  }

  public async currentAccount(): Promise<string | null> {
    if (!this.connected) {
      return null;
    }
    return window.localStorage.getItem(CONNECTOR.CURRENT_ACCOUNT) ?? null;
  }

  public async disconnect(): Promise<boolean> {
    await this._disconnect();
    this.connected = false;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(SELECTED_PREDICATE_KEY);
        window.localStorage.removeItem(CONNECTOR.CURRENT_ACCOUNT);
      }
    } catch (error) {
      console.error('Error clearing localStorage during disconnect:', error);
    }

    this.emit(this.events.connection, false);
    this.emit(this.events.currentAccount, null);
    this.emit(this.events.accounts, []);

    return true;
  }

  public async networks(): Promise<Network[]> {
    return [await this.currentNetwork()];
  }

  public async currentNetwork(): Promise<Network> {
    const { fuelProvider } = await this._get_providers();
    return {
      url: fuelProvider.url,
      chainId: await fuelProvider.getChainId(),
    };
  }

  public async signMessage(
    _address: string,
    _message: string,
  ): Promise<string> {
    return await this._sign_message(_message);
  }

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

  constructor() {
    super();
    this.socketClient = SocketClient.create({
      sessionId: this.getSessionId(),
      events: this,
    });
  }

  protected getSessionId(): string {
    let sessionId = window?.localStorage.getItem(CONNECTOR.SESSION_ID) ?? null;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      window?.localStorage.setItem(CONNECTOR.SESSION_ID, sessionId);
    }

    return sessionId;
  }

  protected custonEvent(event: string, data: unknown): void {
    if (!this.socketClient) {
      throw new Error('Socket client is not initialized');
    }
    this.socketClient.server.emit(event, data);
  }

  protected async emitAccountChange(
    _address: string,
    connected = true,
  ): Promise<void> {
    this.emit(this.events.connection, connected);
    this.emit(this.events.currentAccount, this.currentAccount());
    this.emit(
      this.events.accounts,
      [],
      // this.predicateAccount?.getPredicateAddresses(await this.walletAccounts())
    );
  }

  protected subscribe(listener: () => void) {
    this.subscriptions.push(listener);
  }

  public clearSubscriptions() {
    if (!this.subscriptions) {
      return;
    }
    this.subscriptions.forEach((listener) => listener());
    this.subscriptions = [];
  }
}
