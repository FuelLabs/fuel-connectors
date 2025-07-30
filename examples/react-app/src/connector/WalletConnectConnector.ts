import {
  ecrecover,
  fromRpcSig,
  hashPersonalMessage,
  hexToBytes,
  pubToAddress,
} from "@ethereumjs/util";
import { hexlify, splitSignature } from "@ethersproject/bytes";
import {
  type Config,
  type GetAccountReturnType,
  disconnect,
  getAccount,
  reconnect,
  watchAccount,
} from "@wagmi/core";
import type { Web3Modal } from "@web3modal/wagmi";
import {
  bakoCoder,
  BakoProvider,
  SignatureType,
  TypeUser,
  Vault,
} from "bakosafe";
import {
  Address,
  CHAIN_IDS,
  type ConnectorMetadata,
  FuelConnectorEventTypes,
  type FuelConnectorSendTxParams,
  Provider as FuelProvider,
  LocalStorage,
  type StorageAbstract,
  type TransactionRequestLike,
  type TransactionResponse,
} from "fuels";

import { ApiController } from "@web3modal/core";
import { type TransactionRequest, stringToHex } from "viem";
import {
  type EIP1193Provider,
  EthereumWalletAdapter,
  type Maybe,
  PredicateConnector,
  type PredicateVersion,
  type PredicateWalletAdapter,
  type ProviderDictionary,
  getFuelPredicateAddresses,
  getMockedSignatureIndex,
  getOrThrow,
  getProviderUrl,
} from "./commom";
import {
  ETHEREUM_ICON,
  HAS_WINDOW,
  SIGNATURE_VALIDATION_TIMEOUT,
  WINDOW,
} from "./constants";
import type { CustomCurrentConnectorEvent, WalletConnectConfig } from "./types";
// import { subscribeAndEnforceChain } from "./utils";
import { createWagmiConfig, createWeb3ModalInstance } from "./web3Modal";
import { randomUUID } from "fuels";

export class WalletConnectConnector extends PredicateConnector {
  name = "Ethereum Wallets";
  installed = true;
  events = FuelConnectorEventTypes;
  metadata: ConnectorMetadata = {
    image: ETHEREUM_ICON,
    install: {
      action: "Install",
      description: "Install Ethereum Wallet to connect to Fuel",
      link: "https://ethereum.org/en/wallets/find-wallet/",
    },
  };

  private fuelProvider!: FuelProvider;
  private ethProvider!: EIP1193Provider;
  private web3Modal!: Web3Modal;
  private storage: StorageAbstract;
  private config: WalletConnectConfig = {} as WalletConnectConfig;

  constructor(config: WalletConnectConfig) {
    super();
    this.storage =
      config.storage || new LocalStorage(WINDOW?.localStorage as Storage);
    const wagmiConfig = config?.wagmiConfig ?? createWagmiConfig();

    // if (wagmiConfig._internal.syncConnectedChain !== false) {
    //   subscribeAndEnforceChain(wagmiConfig);
    // }

    this.customPredicate = config.predicateConfig || null;
    if (HAS_WINDOW) {
      this._config_providers({ ...config, wagmiConfig });
    }
    // this.loadPersistedConnection();
  }

  // createModal re-instanciates the modal to update singletons from web3modal
  private createModal() {
    this.clearSubscriptions();
    this.web3Modal = this.modalFactory(this.config);
    ApiController.prefetch();
    this.setupWatchers();
  }

  private modalFactory(config: WalletConnectConfig) {
    return createWeb3ModalInstance({
      projectId: config.projectId,
      wagmiConfig: config.wagmiConfig,
    });
  }

  private async handleConnect(
    account: NonNullable<GetAccountReturnType<Config>>,
    defaultAccount: string | null = null
  ) {
    this.emit(this.events.connection, true);
    this.emit(
      this.events.currentAccount,
      defaultAccount ?? (account?.address as string)
    );
    this.emit(this.events.accounts, []);
  }

  private setupWatchers() {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) throw new Error("Wagmi config not found");

    this.subscribe(
      watchAccount(wagmiConfig, {
        onChange: async (account) => {
          switch (account.status) {
            case "connected": {
              await this.handleConnect(account);
              break;
            }
            case "disconnected": {
              this.emit(this.events.connection, false);
              this.emit(this.events.currentAccount, null);
              this.emit(this.events.accounts, []);
              break;
            }
          }
        },
      })
    );
  }

  protected getWagmiConfig(): Maybe<Config> {
    return this.config?.wagmiConfig;
  }

  protected async _config_providers(config: WalletConnectConfig = {}) {
    const network = getProviderUrl(config?.chainId ?? CHAIN_IDS.fuel.mainnet);
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || new FuelProvider(network),
    });
  }

  protected _get_current_evm_address(): Maybe<string> {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) return null;
    const { addresses = [] } = getAccount(wagmiConfig);
    if (addresses.length === 0) return null;
    const address = addresses[0];

    return address;
  }

  protected async _require_connection() {
    const wagmiConfig = this.getWagmiConfig();
    if (!this.web3Modal) this.createModal();

    if (this.config.skipAutoReconnect || !wagmiConfig) return;

    const { status, connections } = wagmiConfig.state;
    if (status === "disconnected" && connections.size > 0) {
      await reconnect(wagmiConfig);
    }
  }

  protected async _get_providers(): Promise<ProviderDictionary> {
    if (this.fuelProvider && this.ethProvider) {
      return {
        fuelProvider: this.fuelProvider,
        ethProvider: this.ethProvider,
      };
    }
    if (!this.fuelProvider) {
      this.fuelProvider = getOrThrow(
        await this.config.fuelProvider,
        "Fuel provider is not available"
      );
    }

    const wagmiConfig = this.getWagmiConfig();
    const ethProvider = wagmiConfig
      ? ((await getAccount(
          wagmiConfig
        ).connector?.getProvider?.()) as EIP1193Provider)
      : undefined;

    return {
      fuelProvider: this.fuelProvider,
      ethProvider,
    };
  }

  protected async _sign_message(message: string): Promise<string> {
    const { ethProvider } = await this._get_providers();
    const currentAccount = this._get_current_evm_address();
    const a = await ethProvider?.request({
      method: "personal_sign",
      params: [stringToHex(message), currentAccount],
    });
    console.log(a);
    return a as string;
  }

  public async connect(): Promise<boolean> {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) throw new Error("Wagmi config not found");

    // // User might have connected already, now let's ask for the signatures
    // const state = await this.requestSignatures(wagmiConfig);
    // if (state === "validated") {
    //   return true;
    // }

    // User not connected, let's show the WalletConnect modal
    this.createModal();
    this.web3Modal.open();
    const unsub = this.web3Modal.subscribeEvents(async (event) => {
      switch (event.data.event) {
        case "MODAL_OPEN":
          // Ensures that the WC Web3Modal config is applied over pre-existing states (e.g. Solana Connect Web3Modal)
          this.createModal();
          break;
        case "CONNECT_SUCCESS": {
          await super.connect();
          unsub();
          break;
        }
        case "MODAL_CLOSE":
        case "CONNECT_ERROR": {
          unsub();
          break;
        }
      }
    });
    return false;
  }

  public async disconnect(): Promise<boolean> {
    const wagmiConfig = this.getWagmiConfig();
    if (!wagmiConfig) throw new Error("Wagmi config not found");

    const { connector, isConnected } = getAccount(wagmiConfig);
    await disconnect(wagmiConfig, {
      connector,
    });

    await super.disconnect();

    return isConnected || false;
  }

  public async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
    params?: FuelConnectorSendTxParams
  ): Promise<TransactionResponse> {
    try {
      const { fuelProvider } = await this._get_providers();
      const a = this._get_current_evm_address()!;
      const _address = new Address(a).toB256();
      const bakoProvider = await BakoProvider.create(fuelProvider.url, {
        address: _address,
        token: `connector${this.getSessionId()}`,
      });

      const vault = await Vault.fromAddress(
        new Address(address).toB256(),
        bakoProvider
      );
      const { tx, hashTxId } = await vault.BakoTransfer(transaction);

      console.log("[CONNECTOR]TRANSACTION", tx, hashTxId);
      const signature = await this._sign_message(hashTxId);

      console.log(signature);
      // signature: bakoCoder.encode({
      //   type: SignatureType.Fuel,
      //   signature,
      // }),
      const _signature = bakoCoder.encode({
        type: SignatureType.Evm,
        signature,
      });

      console.log("[CONNECTOR]SIGNATURE", tx.witnesses);

      const _a_ = await bakoProvider.signTransaction({
        hash: hashTxId,
        signature: _signature,
      });
      console.log("[CONNECTOR]SIGNATURE", _a_);

      const _a = await vault.send(tx);
      console.log(_a);

      const r = await _a.waitForResult();
      // .then(async (res) => {
      //   const r = await res.waitForResult();
      //   console.log("[CONNECTOR]SEND TX", r);
      //   return r;
      // })
      // .catch((e) => {
      //   console.error("[CONNECTOR]SEND TX ERROR", e);
      //   throw e;
      // });
      console.log("[CONNECTOR]SIGNATURE", _a, r);

      // sign
      // send

      return _a;
    } catch (e) {
      console.error("[CONNECTOR]TRANSACTION ERROR", e);
      throw e;
    }
  }

  async signMessageCustomCurve(message: string) {
    const { ethProvider } = await this._get_providers();
    if (!ethProvider) throw new Error("Eth provider not found");
    const accountAddress = await this._get_current_evm_address();
    if (!accountAddress) throw new Error("No connected accounts");
    const signature = await ethProvider.request({
      method: "personal_sign",
      params: [accountAddress, message],
    });
    return {
      curve: "secp256k1",
      signature: signature as string,
    };
  }
}
