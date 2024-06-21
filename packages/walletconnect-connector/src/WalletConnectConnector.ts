import { hexToBytes } from '@ethereumjs/util';
import { hexlify, splitSignature } from '@ethersproject/bytes';
import {
  type Config,
  disconnect,
  getAccount,
  reconnect,
  watchAccount,
} from '@wagmi/core';
import type { Web3Modal } from '@web3modal/wagmi';
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
  bn,
  transactionRequestify,
} from 'fuels';

import { VERSIONS } from '../versions/versions-dictionary';
import { ETHEREUM_ICON, TESTNET_URL } from './constants';
import type { Predicate, PredicateConfig, WalletConnectConfig } from './types';
import { PredicateAccount } from './utils/Predicate';
import { createModalConfig } from './utils/wagmiConfig';
export class WalletConnectConnector extends FuelConnector {
  name = 'Ethereum Wallets';

  connected = false;
  installed = false;

  predicateAddress: string | null = null;
  customPredicate: PredicateConfig | null;

  events = FuelConnectorEventTypes;

  metadata: ConnectorMetadata = {
    image: ETHEREUM_ICON,
    install: {
      action: 'Install',
      description: 'Install Ethereum Wallet to connect to Fuel',
      link: 'https://ethereum.org/en/wallets/find-wallet/',
    },
  };

  wagmiConfig: Config;
  ethProvider: unknown | null = null;
  fuelProvider: FuelProvider | null = null;
  web3Modal: Web3Modal;

  predicateAccount: PredicateAccount | null = null;

  private config: WalletConnectConfig = {};
  private _unsubs: Array<() => void> = [];

  constructor(config: WalletConnectConfig = {}) {
    super();

    const { wagmiConfig, web3Modal } = createModalConfig(config);
    this.wagmiConfig = wagmiConfig;
    this.web3Modal = web3Modal;

    this.customPredicate = config.predicateConfig || null;

    this.configProviders(config);
    this.setupWatchers();
  }

  async configProviders(config: WalletConnectConfig = {}) {
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || FuelProvider.create(TESTNET_URL),
    });
  }

  async setupPredicate(): Promise<PredicateAccount> {
    if (this.customPredicate?.abi && this.customPredicate?.bytecode) {
      this.predicateAccount = new PredicateAccount(this.customPredicate);
      this.predicateAddress = 'custom';

      return this.predicateAccount;
    }

    const predicateVersions = Object.entries(VERSIONS).map(([key, pred]) => ({
      pred,
      key,
    }));

    let predicateWithBalance: Predicate | null = null;

    for (const predicateVersion of predicateVersions) {
      const predicateInstance = new PredicateAccount({
        abi: predicateVersion.pred.predicate.abi,
        bytecode: predicateVersion.pred.predicate.bytecode,
      });

      const account = getAccount(this.wagmiConfig);
      const address = account.address;

      if (!address) {
        continue;
      }

      const { fuelProvider } = await this.getProviders();
      const predicate = predicateInstance.createPredicate(
        address,
        fuelProvider,
        [1],
      );

      const balance = await predicate.getBalance();

      if (balance.toString() !== bn(0).toString()) {
        predicateWithBalance = predicateVersion.pred;
        this.predicateAddress = predicateVersion.key;
        break;
      }
    }

    if (predicateWithBalance) {
      this.predicateAccount = new PredicateAccount({
        abi: predicateWithBalance.predicate.abi,
        bytecode: predicateWithBalance.predicate.bytecode,
      });

      return this.predicateAccount;
    }

    const newestPredicate = predicateVersions.sort(
      (a, b) => Number(b.pred.generatedAt) - Number(a.pred.generatedAt),
    )[0];

    if (newestPredicate) {
      this.predicateAccount = new PredicateAccount({
        abi: newestPredicate.pred.predicate.abi,
        bytecode: newestPredicate.pred.predicate.bytecode,
      });
      this.predicateAddress = newestPredicate.key;

      return this.predicateAccount;
    }

    throw new Error('No predicate found');
  }

  /**
   * ============================================================
   * Application communication methods
   * ============================================================
   */
  evmAccounts(): Array<string> {
    const accounts = getAccount(this.wagmiConfig).addresses;
    return accounts as Array<string>;
  }

  setupWatchers() {
    this._unsubs.push(
      watchAccount(this.wagmiConfig, {
        onChange: async (account) => {
          const predicateAccount = await this.predicateAccount;

          switch (account.status) {
            case 'connected': {
              await this.setupPredicate();

              this.emit(this.events.connection, true);
              this.emit(
                this.events.currentAccount,
                predicateAccount?.getPredicateAddress(account.address),
              );
              this.emit(
                this.events.accounts,
                predicateAccount?.getPredicateAccounts(this.evmAccounts()),
              );
              break;
            }
            case 'disconnected': {
              this.emit(this.events.connection, false);
              this.emit(this.events.currentAccount, null);
              this.emit(this.events.accounts, []);
              break;
            }
          }
        },
      }),
    );
  }

  destroy() {
    this._unsubs.forEach((unsub) => unsub());
  }

  async getProviders() {
    if (!this.fuelProvider) {
      this.fuelProvider = (await this.config.fuelProvider) ?? null;

      if (!this.fuelProvider) {
        throw new Error('Fuel provider not found');
      }
    }

    return {
      fuelProvider: this.fuelProvider,
    };
  }

  /**
   * ============================================================
   * Connector methods
   * ============================================================
   */
  async ping(): Promise<boolean> {
    await this.getProviders();
    return true;
  }

  async version(): Promise<Version> {
    return { app: '0.0.0', network: '0.0.0' };
  }

  async requireConnection() {
    const { state } = this.wagmiConfig;
    if (state.status === 'disconnected' && state.connections.size > 0) {
      await reconnect(this.wagmiConfig);
    }
  }

  async isConnected(): Promise<boolean> {
    await this.requireConnection();
    const account = getAccount(this.wagmiConfig);
    return account.isConnected || false;
  }

  async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      this.web3Modal.open();
      const unsub = this.web3Modal.subscribeEvents(async (event) => {
        switch (event.data.event) {
          case 'CONNECT_SUCCESS': {
            resolve(true);
            unsub();
            break;
          }
          case 'MODAL_CLOSE':
          case 'CONNECT_ERROR': {
            resolve(false);
            unsub();
            break;
          }
        }
      });
    });
  }

  async disconnect(): Promise<boolean> {
    const { connector } = getAccount(this.wagmiConfig);
    await disconnect(this.wagmiConfig, {
      connector,
    });
    return this.isConnected();
  }

  async accounts(): Promise<Array<string>> {
    if (!this.predicateAccount) {
      throw Error('No predicate account found');
    }

    await this.requireConnection();

    return this.predicateAccount.getPredicateAccounts(this.evmAccounts());
  }

  async signMessage(_address: string, _message: string): Promise<string> {
    throw new Error('A predicate account cannot sign messages');
  }

  async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<string> {
    if (!(await this.isConnected())) {
      throw Error('No connected accounts');
    }

    if (!this.predicateAccount) {
      throw Error('No predicate account found');
    }

    const { fuelProvider } = await this.getProviders();
    const chainId = fuelProvider.getChainId();
    const evmAccount = this.predicateAccount.getEVMAddress(
      address,
      this.evmAccounts(),
    );
    if (!evmAccount) {
      throw Error(`No account found for ${address}`);
    }
    const transactionRequest = transactionRequestify(transaction);

    // Create a predicate and set the witness index to call in predicate`
    const predicate = this.predicateAccount.createPredicate(
      evmAccount,
      fuelProvider,
      [transactionRequest.witnesses.length - 1],
    );
    predicate.connect(fuelProvider);

    // Attach missing inputs (including estimated predicate gas usage) / outputs to the request
    await predicate.provider.estimateTxDependencies(transactionRequest);

    // To each input of the request, attach the predicate and its data
    const requestWithPredicateAttached =
      predicate.populateTransactionPredicateData(transactionRequest);

    requestWithPredicateAttached.inputs.forEach((input) => {
      if ('predicate' in input && input.predicate) {
        input.witnessIndex = 0;
      }
    });

    const txID = requestWithPredicateAttached.getTransactionId(chainId);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const provider: any = await getAccount(
      this.wagmiConfig,
    ).connector?.getProvider();
    const signature = await provider.request({
      method: 'personal_sign',
      params: [txID, evmAccount],
    });

    // Transform the signature into compact form for Sway to understand
    const compactSignature = splitSignature(hexToBytes(signature)).compact;
    transactionRequest.witnesses.push(compactSignature);

    const transactionWithPredicateEstimated =
      await fuelProvider.estimatePredicates(requestWithPredicateAttached);

    const response = await fuelProvider.operations.submit({
      encodedTransaction: hexlify(
        transactionWithPredicateEstimated.toTransactionBytes(),
      ),
    });

    return response.submit.id;
  }

  async currentAccount(): Promise<string | null> {
    if (!(await this.isConnected())) {
      throw Error('No connected accounts');
    }
    const ethAccount = getAccount(this.wagmiConfig).address || null;

    return (
      this.predicateAccount?.getPredicateAddress(ethAccount as string) ?? null
    );
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
    const { fuelProvider } = await this.getProviders();
    const chainId = fuelProvider.getChainId();

    return { url: fuelProvider.url, chainId: chainId };
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
