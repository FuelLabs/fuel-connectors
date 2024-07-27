import { hexToBytes } from '@ethereumjs/util';
import { hexlify, splitSignature } from '@ethersproject/bytes';
import {
  type Config,
  type GetAccountReturnType,
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
  ZeroBytes32,
  bn,
  calculateGasFee,
  concat,
  transactionRequestify,
} from 'fuels';

import { ApiController } from '@web3modal/core';
import { VERSIONS } from '../versions/versions-dictionary';
import { ETHEREUM_ICON, TESTNET_URL } from './constants';
import type { Predicate, PredicateConfig, WalletConnectConfig } from './types';
import { PredicateAccount } from './utils/Predicate';
import { createWagmiConfig } from './utils/wagmiConfig';
import { createWeb3ModalInstance } from './utils/web3Modal';
import { getSignatureIndex } from './utils/witness';

export class WalletConnectConnector extends FuelConnector {
  name = 'Ethereum Wallets';

  connected = false;
  installed = true;

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

  ethProvider: unknown | null = null;
  fuelProvider: FuelProvider | null = null;
  web3Modal!: Web3Modal;

  predicateAccount: PredicateAccount | null = null;

  private config: WalletConnectConfig = {} as WalletConnectConfig;
  private _unsubs: Array<() => void> = [];

  constructor(config: WalletConnectConfig) {
    super();

    const wagmiConfig = config?.wagmiConfig ?? createWagmiConfig();
    this.customPredicate = config.predicateConfig || null;
    this.configProvider({ ...config, wagmiConfig });
    this.loadPersistedConnection();
  }

  async loadPersistedConnection() {
    if (!this.config?.wagmiConfig) return;
    await this.config?.fuelProvider;
    await this.requireConnection();
    await this.handleConnect(getAccount(this.config?.wagmiConfig));
  }

  getWagmiConfig() {
    return this.config?.wagmiConfig;
  }

  // createModal re-instanciates the modal to update singletons from web3modal
  createModal() {
    this.destroy();
    this.web3Modal = this.modalFactory(this.config);
    ApiController.prefetch();
    this.setupWatchers();
  }

  modalFactory(config: WalletConnectConfig) {
    return createWeb3ModalInstance({
      projectId: config.projectId,
      wagmiConfig: config.wagmiConfig,
    });
  }

  configProvider(config: WalletConnectConfig) {
    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || FuelProvider.create(TESTNET_URL),
    });
  }

  currentEvmAccount(): string | null {
    if (!this.config?.wagmiConfig) return null;
    const ethAccount = getAccount(this.config.wagmiConfig).address || null;

    return ethAccount;
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

    if (!this.config?.wagmiConfig) {
      throw new Error('Wagmi config not found');
    }

    for (const predicateVersion of predicateVersions) {
      const predicateInstance = new PredicateAccount({
        abi: predicateVersion.pred.predicate.abi,
        bytecode: predicateVersion.pred.predicate.bytecode,
      });

      const account = getAccount(this.config.wagmiConfig);
      const address = account.address;

      if (!address) {
        continue;
      }

      const { fuelProvider } = await this.getProvider();
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
    if (!this.config?.wagmiConfig) return [];
    const accounts = getAccount(this.config.wagmiConfig).addresses;
    return accounts as Array<string>;
  }

  async handleConnect(account: NonNullable<GetAccountReturnType<Config>>) {
    if (!account?.address) {
      return;
    }
    await this.setupPredicate();
    this.emit(this.events.connection, true);
    this.emit(
      this.events.currentAccount,
      this.predicateAccount?.getPredicateAddress(account.address),
    );
    this.emit(
      this.events.accounts,
      this.predicateAccount?.getPredicateAccounts(this.evmAccounts()),
    );
  }

  setupWatchers() {
    if (!this.config?.wagmiConfig) {
      throw new Error('Wagmi config not found');
    }
    this._unsubs.push(
      watchAccount(this.config.wagmiConfig, {
        onChange: async (account) => {
          switch (account.status) {
            case 'connected': {
              await this.handleConnect(account);
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

  async getProvider() {
    if (!this.config.fuelProvider) {
      throw new Error('Fuel provider not found');
    }

    if (!this.fuelProvider) {
      this.fuelProvider = await this.config.fuelProvider;
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
    return true;
  }

  async version(): Promise<Version> {
    return { app: '0.0.0', network: '0.0.0' };
  }

  async requireConnection() {
    if (!this.web3Modal) this.createModal();
    if (!this.config?.wagmiConfig) return;

    const { state } = this.config.wagmiConfig;
    if (state.status === 'disconnected' && state.connections.size > 0) {
      await reconnect(this.config.wagmiConfig);
    }
  }

  async isConnected(): Promise<boolean> {
    await this.requireConnection();
    if (!this.config?.wagmiConfig) return false;
    const account = getAccount(this.config.wagmiConfig || {});
    return account.isConnected || false;
  }

  async connect(): Promise<boolean> {
    this.createModal();

    return new Promise((resolve) => {
      this.web3Modal.open();
      const unsub = this.web3Modal.subscribeEvents(async (event) => {
        switch (event.data.event) {
          case 'MODAL_OPEN':
            if (this.config?.wagmiConfig) {
              const account = getAccount(this.config.wagmiConfig);
              if (account?.isConnected) {
                this.web3Modal.close();
                resolve(true);
                unsub();
                break;
              }
            }
            // Ensures that the WC Web3Modal config is applied over pre-existing states (e.g. Solan Connect Web3Modal)
            this.createModal();
            break;
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
    if (!this.config?.wagmiConfig) {
      throw new Error('Wagmi config not found');
    }
    const { connector, isConnected } = getAccount(this.config.wagmiConfig);
    await disconnect(this.config.wagmiConfig, {
      connector,
    });

    return isConnected || false;
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

    if (!this.config?.wagmiConfig) {
      throw new Error('Wagmi config not found');
    }

    const { fuelProvider } = await this.getProvider();
    const chainId = fuelProvider.getChainId();
    const evmAccount = this.predicateAccount.getEVMAddress(
      address,
      this.evmAccounts(),
    );
    if (!evmAccount) {
      throw Error(`No account found for ${address}`);
    }
    const transactionRequest = transactionRequestify(transaction);
    const transactionFee = transactionRequest.maxFee.toNumber();

    const predicateSignatureIndex = getSignatureIndex(
      transactionRequest.witnesses,
    );

    // Create a predicate and set the witness index to call in predicate`
    const predicate = this.predicateAccount.createPredicate(
      evmAccount,
      fuelProvider,
      [predicateSignatureIndex],
    );
    predicate.connect(fuelProvider);

    // To each input of the request, attach the predicate and its data
    const requestWithPredicateAttached =
      predicate.populateTransactionPredicateData(transactionRequest);

    const maxGasUsed =
      await this.predicateAccount.getMaxPredicateGasUsed(fuelProvider);

    let predictedGasUsedPredicate = bn(0);
    requestWithPredicateAttached.inputs.forEach((input) => {
      if ('predicate' in input && input.predicate) {
        input.witnessIndex = 0;
        predictedGasUsedPredicate = predictedGasUsedPredicate.add(maxGasUsed);
      }
    });

    // Add a placeholder for the predicate signature to count on bytes measurement from start. It will be replaced later
    requestWithPredicateAttached.witnesses[predicateSignatureIndex] = concat([
      ZeroBytes32,
      ZeroBytes32,
    ]);

    const { gasPriceFactor } = await predicate.provider.getGasConfig();
    const { maxFee, gasPrice } = await predicate.provider.estimateTxGasAndFee({
      transactionRequest: requestWithPredicateAttached,
    });

    const predicateSuccessFeeDiff = calculateGasFee({
      gas: predictedGasUsedPredicate,
      priceFactor: gasPriceFactor,
      gasPrice,
    });

    const feeWithFat = maxFee.add(predicateSuccessFeeDiff);
    const isNeededFatFee = feeWithFat.gt(transactionFee);

    if (isNeededFatFee) {
      // add more 10 just in case sdk fee estimation is not accurate
      requestWithPredicateAttached.maxFee = feeWithFat.add(10);
    }

    // Attach missing inputs (including estimated predicate gas usage) / outputs to the request
    await predicate.provider.estimateTxDependencies(
      requestWithPredicateAttached,
    );

    // gets the transactionID in fuel and ask to sign in eth wallet
    const txID = requestWithPredicateAttached.getTransactionId(chainId);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const provider: any = await getAccount(
      this.config.wagmiConfig,
    ).connector?.getProvider();
    const signature = await provider.request({
      method: 'personal_sign',
      params: [txID, evmAccount],
    });

    // Transform the signature into compact form for Sway to understand
    const compactSignature = splitSignature(hexToBytes(signature)).compact;
    requestWithPredicateAttached.witnesses[predicateSignatureIndex] =
      compactSignature;

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
    if (!this.config?.wagmiConfig) {
      throw new Error('Wagmi config not found');
    }
    const ethAccount = getAccount(this.config.wagmiConfig).address || null;

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
    const { fuelProvider } = await this.getProvider();
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
