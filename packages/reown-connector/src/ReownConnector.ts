import {
  EthereumWalletAdapter,
  type PredicateConnector,
  getFuelPredicateAddresses,
} from '@fuel-connectors/common';
import { PREDICATE_VERSIONS } from '@fuel-connectors/evm-predicates';
import {
  type Asset,
  type ConnectorMetadata,
  type FuelABI,
  FuelConnector,
  FuelConnectorEventTypes,
  type Network,
  type SelectNetworkArguments,
  type TransactionRequestLike,
  type Version,
} from 'fuels';
import { PredicateEvm } from './predicates/evm/PredicateEvm';
import { ETHEREUM_ICON } from './predicates/evm/constants';
import { PredicateSvm } from './predicates/svm/PredicateSvm';
import type { ReownConnectorConfig } from './types';

export class ReownConnector extends FuelConnector {
  name = 'Ethereum / Solana Wallets';
  installed = true;
  events = FuelConnectorEventTypes;
  metadata: ConnectorMetadata = {
    image: ETHEREUM_ICON, // @TODO: Put a better icon to match Solana and ETH
    install: {
      action: 'Install',
      description: 'Install Ethereum or Solana Wallet to connect to Fuel',
      link: 'https://ethereum.org/en/wallets/find-wallet/', // @TODO: Put a better link
    },
  };

  private predicateInstance!: PredicateConnector;
  private config: ReownConnectorConfig;

  constructor(config: ReownConnectorConfig) {
    super();

    this.config = config;
    this.setPredicateInstance();
  }

  private setPredicateInstance() {
    if (this.config.appkit.getActiveChainNamespace() === 'eip155') {
      this.predicateInstance = new PredicateEvm(this.config);
      return;
    }

    this.predicateInstance = new PredicateSvm(this.config);
  }

  /**
   * ============================================================
   * Connector methods
   * ============================================================
   */
  async ping(): Promise<boolean> {
    return this.predicateInstance.ping();
  }

  async isConnected(): Promise<boolean> {
    return this.predicateInstance.isConnected();
  }

  async connect(): Promise<boolean> {
    this.setPredicateInstance();
    return this.predicateInstance.connect();
  }

  async disconnect(): Promise<boolean> {
    this.setPredicateInstance();
    return this.predicateInstance.disconnect();
  }

  async accounts(): Promise<Array<string>> {
    return this.predicateInstance.accounts();
  }

  async currentAccount(): Promise<string | null> {
    return this.predicateInstance.currentAccount();
  }

  async signMessage(address: string, message: string): Promise<string> {
    return this.predicateInstance.signMessage(address, message);
  }

  async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<string> {
    return this.predicateInstance.sendTransaction(address, transaction);
  }

  async assets(): Promise<Array<Asset>> {
    return this.predicateInstance.assets();
  }

  async addAsset(asset: Asset): Promise<boolean> {
    return this.predicateInstance.addAsset(asset);
  }

  async addAssets(assets: Asset[]): Promise<boolean> {
    return this.predicateInstance.addAssets(assets);
  }

  async addAbi(contractId: string, abi: FuelABI): Promise<boolean> {
    return this.predicateInstance.addAbi(contractId, abi);
  }

  async getABI(contractId: string): Promise<FuelABI> {
    return this.predicateInstance.getAbi(contractId);
  }

  async hasABI(contractId: string): Promise<boolean> {
    return this.predicateInstance.hasAbi(contractId);
  }

  async currentNetwork(): Promise<Network> {
    return this.predicateInstance.currentNetwork();
  }

  async selectNetwork(network: SelectNetworkArguments): Promise<boolean> {
    return this.predicateInstance.selectNetwork(network);
  }

  async networks(): Promise<Network[]> {
    return this.predicateInstance.networks();
  }

  async addNetwork(networkUrl: string): Promise<boolean> {
    return this.predicateInstance.addNetwork(networkUrl);
  }

  async version(): Promise<Version> {
    return this.predicateInstance.version();
  }

  /**
   * ============================================================
   * Predicate Utilities
   * ============================================================
   */
  static getFuelPredicateAddresses(ethAddress: string) {
    const predicateConfig = Object.entries(PREDICATE_VERSIONS)
      .sort(([, a], [, b]) => b.generatedAt - a.generatedAt)
      .map(([evmPredicateAddress, { predicate, generatedAt }]) => ({
        abi: predicate.abi,
        bin: predicate.bin,
        evmPredicate: {
          generatedAt,
          address: evmPredicateAddress,
        },
      }));

    const address = new EthereumWalletAdapter().convertAddress(ethAddress);
    const predicateAddresses = predicateConfig.map(
      ({ abi, bin, evmPredicate }) => ({
        fuelAddress: getFuelPredicateAddresses({
          signerAddress: address,
          predicate: { abi, bin },
        }),
        evmPredicate,
      }),
    );

    return predicateAddresses;
  }
}
