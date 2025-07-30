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
  randomUUID,
} from "fuels";

import { PredicateFactory } from "./PredicateFactory";
import type {
  ConnectorConfig,
  Maybe,
  MaybeAsync,
  PredicateConfig,
  ProviderDictionary,
  SignedMessageCustomCurve,
} from "./types";
import { BakoProvider, TypeUser } from "bakosafe";
import { SocketClient } from "./socketClient";

const SELECTED_PREDICATE_KEY = "fuel_selected_predicate_version";

// enviar uma request connectDapp com uma autenticacao (sessão assinada) vincula o sessionId ao endereço
// ao trocar de conta também é necessário desconectar
const CONNECTOR = {
  AUTH_PREFIX: "connector",
  DEFAULT_ACCOUNT: "default",
  SESSION_ID: "sessionId",
  ACCOUNT_VALIDATED: "accountValidated",
  CURRENT_ACCOUNT: "currentAccount",
};

export abstract class PredicateConnector extends FuelConnector {
  public connected = false;
  public installed = false;
  external = true;
  public events = FuelConnectorEventTypes;
  protected predicateAddress!: string;
  protected customPredicate: Maybe<PredicateConfig>;
  protected predicateAccount: Maybe<PredicateFactory> = null;
  protected subscriptions: Array<() => void> = [];
  protected hasProviderSucceeded = true;

  // eventos sao ouvidos pelo event emmiter: socket recebe, filtra e repassa
  // para emitir o evento, é necessário usar o socket (predicateClass.emitCustomEvent)
  protected socketClient: Maybe<SocketClient> = null;

  public abstract name: string;
  public abstract metadata: ConnectorMetadata;

  public abstract sendTransaction(
    address: string,
    transaction: TransactionRequestLike
  ): Promise<string | TransactionResponse>;

  // /**
  //  * Derived classes MUST call `await super.disconnect();` as part of their
  //  * disconnection logic. They remain responsible for their specific
  //  * disconnection procedures (e.g., from the underlying wallet),
  //  * updating `this.connected` status, and emitting events such as
  //  * `connection`, `currentAccount`, and `accounts`.
  //  * @returns A promise that resolves to true if the base cleanup is successful.
  //  */
  // public async disconnect(): Promise<boolean> {
  //   this.predicateAccount = null; // Ensure predicate is fully re-setup on next connect

  //   try {
  //     if (typeof window !== "undefined" && window.localStorage) {
  //       window.localStorage.removeItem(SELECTED_PREDICATE_KEY);
  //     }
  //   } catch (error) {
  //     console.error(
  //       "Failed to clear selected predicate version from localStorage during disconnect:",
  //       error
  //     );
  //   }
  //   return true;
  // }

  public async connect(): Promise<boolean> {
    const { fuelProvider } = await this._get_providers();
    const _account = this._get_current_evm_address();
    const account = new Address(_account!).toB256();

    const code = await BakoProvider.setup({
      provider: fuelProvider.url,
      address: account!,
      encoder: TypeUser.EVM,
    });

    const signature = await this._sign_message(code);
    const sessionId = this.getSessionId();

    const provider = await BakoProvider.authenticate(fuelProvider.url, {
      address: account!,
      challenge: code,
      encoder: TypeUser.EVM,
      token: signature,
    });

    await provider.connectDapp(sessionId);

    const a = await provider.wallet();
    console.log(await a.getBalances());

    this.emit(this.events.connection, true);
    this.emit(this.events.currentAccount, a.address);
    this.emit(this.events.accounts, a.address ? [a.address] : []);
    this.connected = true;

    localStorage.setItem(CONNECTOR.CURRENT_ACCOUNT, a.address.toB256());

    return true;
  }

  public async disconnect(): Promise<boolean> {
    this.connected = false;
    this.clearSubscriptions();
    this.socketClient?.disconnect();

    // Clear the current account from localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(CONNECTOR.CURRENT_ACCOUNT);
      window.localStorage.removeItem(CONNECTOR.SESSION_ID);
    }

    this.emit(this.events.connection, false);
    this.emit(this.events.currentAccount, null);
    this.emit(this.events.accounts, []);

    return true;
  }

  // metodos privados que são obrigatórios para implementacao da subclasse
  protected abstract _sign_message(message: string): Promise<string>;
  protected abstract _get_providers(): Promise<ProviderDictionary>;
  protected abstract _get_current_evm_address(): Maybe<string>;
  protected abstract _require_connection(): MaybeAsync<void>;
  protected abstract _config_providers(
    config: ConnectorConfig
  ): MaybeAsync<void>;

  abstract signMessageCustomCurve(
    _message: string
  ): Promise<SignedMessageCustomCurve>;

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

  protected custonEvent(event: string, data: any): void {
    if (!this.socketClient) {
      throw new Error("Socket client is not initialized");
    }
    this.socketClient.server.emit(event, data);
  }

  protected async emitAccountChange(
    address: string,
    connected = true
  ): Promise<void> {
    this.emit(this.events.connection, connected);
    this.emit(
      this.events.currentAccount,
      this.predicateAccount?.getPredicateAddress(address)
    );
    this.emit(
      this.events.accounts,
      []
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

  public async ping(): Promise<boolean> {
    this._get_providers()
      .catch(() => {
        this.hasProviderSucceeded = false;
      })
      .then(() => {
        this.hasProviderSucceeded = true;
      });
    return this.hasProviderSucceeded;
  }

  public async version(): Promise<Version> {
    return { app: "0.0.0", network: "0.0.0" };
  }

  public async isConnected(): Promise<boolean> {
    await this._require_connection();
    const accounts = await this.accounts();
    return accounts.length > 0;
  }

  public async accounts(): Promise<Array<string>> {
    const a = window.localStorage.getItem(CONNECTOR.CURRENT_ACCOUNT) ?? null;

    return !a ? [] : [a];
  }

  public async currentAccount(): Promise<string | null> {
    if (!this.connected) {
      throw Error("No connected accounts");
    }
    const a = window.localStorage.getItem(CONNECTOR.CURRENT_ACCOUNT) ?? null;

    return a;
  }

  public async networks(): Promise<Network[]> {
    return [await this.currentNetwork()];
  }

  public async currentNetwork(): Promise<Network> {
    const { fuelProvider } = await this._get_providers();
    const chainId = await fuelProvider.getChainId();

    return { url: fuelProvider.url, chainId: chainId };
  }

  public async signMessage(
    _address: string,
    _message: HashableMessage
  ): Promise<string> {
    throw new Error("A predicate account cannot sign messages");
  }

  public async addAssets(_assets: Asset[]): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  public async addAsset(_asset: Asset): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  public async assets(): Promise<Array<Asset>> {
    return [];
  }

  public async addNetwork(_networkUrl: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  public async selectNetwork(
    _network: SelectNetworkArguments
  ): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  public async addAbi(_abiMap: AbiMap): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  public async getAbi(_contractId: string): Promise<JsonAbi> {
    throw Error("Cannot get contractId ABI for a predicate");
  }

  public async hasAbi(_contractId: string): Promise<boolean> {
    throw Error("A predicate account cannot have an ABI");
  }
}
