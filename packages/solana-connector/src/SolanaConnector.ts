import type { Web3Modal } from '@web3modal/solana';
import {
  type AbiMap,
  type Asset,
  type ConnectorMetadata,
  FuelConnector,
  FuelConnectorEventTypes,
  Provider as FuelProvider,
  type JsonAbi,
  type Network,
  type TransactionRequestLike,
  type Version,
} from 'fuels';
import { DEVNET_URL, SOLANA_ICON } from './constants';
import type { PredicateConfig, SolanaConfig } from './types';
import { createSolanaProvider } from './utils/solanaProvider';
// import type { PredicateAccount } from "./utils/Predicate";

export class SolanaConnector extends FuelConnector {
  name = 'Solana Wallets';

  connected = false;
  installed = false;

  events = FuelConnectorEventTypes;

  metadata: ConnectorMetadata = {
    image: SOLANA_ICON,
    install: {
      action: 'Install',
      description: 'Install Solana Wallet to connect to Fuel',
      link: 'https://solana.com/ecosystem/explore?categories=wallet',
    },
  };

  walletConnectModal: Web3Modal;
  fuelProvider: FuelProvider | null = null;

  predicateAddress: string | null = null;
  customPredicate: PredicateConfig | null;

  // private predicateAccount: PredicateAccount;
  private config: SolanaConfig = {};

  // private _unsubs: Array<() => void> = [];

  constructor(config: SolanaConfig = {}) {
    super();

    this.customPredicate = config.predicateConfig || null;

    const { walletConnectModal } = createSolanaProvider(config);
    this.walletConnectModal = walletConnectModal;

    this.configProviders(config);
    // this.setupWatchers();
  }

  async configProviders(config: SolanaConfig = {}) {
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || FuelProvider.create(DEVNET_URL),
    });
  }

  // TODO: Implement this method
  async setupPredicate() {}
  /**
   * ============================================================
   * Application communication methods
   * ============================================================
   */

  // * TODO: Test this method
  async svmAccounts(): Promise<Array<string>> {
    // if (!this.solanaProvider) {
    //   return [];
    // }

    // const accounts: GetAccounts = await this.solanaProvider.request({
    //   method: SolanaMethods.GET_ACCOUNTS,
    //   params: {},
    // });

    // const accountsAddresses = accounts.result.map((account) => account.pubkey);

    // return accountsAddresses;
    return [];
  }

  // * TODO: Test this method
  // async setupWatchers() {
  //   const { solanaProvider, walletConnectModal } = await this.getProviders();

  //   solanaProvider.on(SolanaEvents.DISPLAY_URI, async (uri: string) => {
  //     console.log("Display URI", uri);

  //     await walletConnectModal.openModal({ uri });
  //   });

  //   solanaProvider.on(
  //     SolanaEvents.SESSION_PING,
  //     ({ id, topic }: { id: unknown; topic: unknown }) => {
  //       console.log("Session ping", id, topic);
  //     }
  //   );

  //   solanaProvider.on(
  //     SolanaEvents.SESSION_EVENT,
  //     ({ event, chainId }: { event: unknown; chainId: unknown }) => {
  //       console.log("Session event", event, chainId);
  //     }
  //   );

  //   solanaProvider.on(
  //     SolanaEvents.SESSION_UPDATE,
  //     ({ topic, params }: { topic: unknown; params: unknown }) => {
  //       console.log("Session update", topic, params);
  //     }
  //   );

  //   solanaProvider.on(
  //     SolanaEvents.SESSION_DELETE,
  //     ({ id, topic }: { id: unknown; topic: unknown }) => {
  //       console.log("Session delete", id, topic);
  //     }
  //   );
  // }

  async getProviders() {
    if (!this.fuelProvider) {
      this.fuelProvider = (await this.config.fuelProvider) ?? null;

      if (!this.fuelProvider) {
        throw new Error('Fuel provider not found');
      }
    }

    // if (!this.solanaProvider || !this.walletConnectModal) {
    // const { /* solanaProvider, */ walletConnectModal } =
    // await createSolanaProvider(this.config);

    // this.solanaProvider = solanaProvider;
    // this.walletConnectModal = walletConnectModal;

    //   if (!this.solanaProvider) {
    //     throw new Error("Solana provider not found");
    //   }
    // }

    return {
      fuelProvider: this.fuelProvider,
      // solanaProvider: this.solanaProvider,
      walletConnectModal: this.walletConnectModal,
    };
  }

  /**
   * ============================================================
   * Connector methods
   * ============================================================
   */
  async ping(): Promise<boolean> {
    // await this.configProviders();
    // await this.getProviders();
    // await this.setupWatchers();

    return true;
  }

  async version(): Promise<Version> {
    return { app: '0.0.0', network: '0.0.0' };
  }

  //TODO: Implement this method
  async requireConnection() {}

  // * TODO: Test this method
  async isConnected(): Promise<boolean> {
    // const accounts = await this.svmAccounts();
    const accounts = [];

    return accounts.length > 0;
  }

  // * TODO: Test this method
  async connect(): Promise<boolean> {
    if (!(await this.isConnected())) {
      await this.walletConnectModal.open();

      // await solanaProvider.connect({
      //   namespaces: {
      //     solana: {
      //       methods: solanaMethods,
      //       chains: solanaChains,
      //       events: solanaEvents,
      //     },
      //   },
      // });

      // walletConnectModal.closeModal();

      this.emit(this.events.connection, true);

      this.on(this.events.connection, (connection: boolean) => {
        this.connected = connection;
      });

      return true;
    }

    return this.connected;
  }

  //TODO: Implement this method
  async disconnect(): Promise<boolean> {
    // const { solanaProvider } = await this.getProviders();

    // await solanaProvider.disconnect();

    // this.emit(this.events.connection, false);
    // this.emit(this.events.accounts, []);
    // this.emit(this.events.currentAccount, null);

    return this.isConnected();
  }

  //* TODO: Test this method
  async accounts(): Promise<string[]> {
    // return this.svmAccounts();

    return [];
    // TODO - Get predicate addresses
  }

  async signMessage(_address: string, _message: string): Promise<string> {
    throw new Error('A predicate account cannot sign messages.');
  }

  //TODO: Implement this method
  async sendTransaction(
    _address: string,
    _transaction: TransactionRequestLike,
  ): Promise<string> {
    return '';
  }

  // * TODO: Test this method
  async currentAccount(): Promise<string | null> {
    // if (!(await this.isConnected())) {
    //   throw Error("No connected accounts");
    // }

    // const { solanaProvider } = await this.getProviders();

    // const solanaAccounts: GetAccounts = await solanaProvider.request({
    //   method: SolanaMethods.GET_ACCOUNTS,
    // });

    // const currentAccount = solanaAccounts.result?.[0]?.pubkey;

    // if (!currentAccount) {
    //   throw Error("No Solana account selected");
    // }

    // return currentAccount;
    return '';

    // TODO - Get predicate address
  }

  async addAssets(_assets: Asset[]): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async addAsset(_asset: Asset): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async assets(): Promise<Array<Asset>> {
    return [];
  }

  async addNetwork(_networkUrl: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async selectNetwork(_network: Network): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async networks(): Promise<Network[]> {
    return [await this.currentNetwork()];
  }

  async currentNetwork(): Promise<Network> {
    // const { fuelProvider } = await this.getProviders();
    // const chainId = fuelProvider.getChainId();

    // return { url: fuelProvider.url, chainId: chainId };
    return { url: '', chainId: 0 };
  }

  async addAbi(_abiMap: AbiMap): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async getAbi(_contractId: string): Promise<JsonAbi> {
    throw Error('Cannot get contractId ABI for a predicate');
  }

  async hasAbi(_contractId: string): Promise<boolean> {
    throw Error('A predicate account cannot have an ABI');
  }
}
