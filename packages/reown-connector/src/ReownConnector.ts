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
import type { ReownChain, ReownConnectorConfig } from './types';

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

  private predicatesInstance: Record<ReownChain, PredicateConnector>;
  private activeChain!: ReownChain;
  private config: ReownConnectorConfig;
  private account: string | undefined;

  constructor(config: ReownConnectorConfig) {
    super();

    this.config = config;

    this.setPredicateInstance();
    this.predicatesInstance = {
      ethereum: new PredicateEvm(this.config, this),
      solana: new PredicateSvm(this.config),
    };
  }

  private setPredicateInstance() {
    if (this.config.appkit.getActiveChainNamespace() === 'eip155') {
      this.activeChain = 'ethereum';
      return;
    }

    this.activeChain = 'solana';
  }

  /**
   * ============================================================
   * Connector methods
   * ============================================================
   */
  async ping(): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].ping();
  }

  async isConnected(): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].isConnected();
  }

  async connect(): Promise<boolean> {
    // If we already have an account, we don't need to open the appkit modal
    if (this.config.appkit.getAddress()) {
      this.setPredicateInstance();
      const res = await this.predicatesInstance[this.activeChain].connect();
      return res;
    }

    // New connection
    await this.config.appkit.open();

    return new Promise((resolve) => {
      this.config.appkit.subscribeAccount((account) => {
        // User has just connected (this is a good approach to handle any chain)
        // We need to update the predicate instance to the correct chain
        // Since some wallets allow to switch between chains (e.g. Phantom)
        if (account.address && account.address !== this.account) {
          this.setPredicateInstance();
          this.account = account.address;

          const connector = this.predicatesInstance[this.activeChain];
          connector
            .connect()
            .then((res) => {
              resolve(res);
            })
            .catch(() => {
              resolve(false);
            });
          return;
        }

        // User/wallet has disconnected during connection flow
        if (!account.address && this.account) {
          this.account = undefined;
          resolve(false);
          return;
        }
      });

      // Just to monitoring close modal and connection is not established yet
      // So we disable "connecting" state and allow user to connect again
      const unsub = this.config.appkit.subscribeEvents((event) => {
        switch (event.data.event) {
          case 'MODAL_CLOSE':
          case 'CONNECT_ERROR': {
            if (this.account) {
              return;
            }

            resolve(false);
            unsub?.();
            break;
          }
        }
      });
    });
  }

  async disconnect(): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].disconnect();
  }

  async accounts(): Promise<Array<string>> {
    return this.predicatesInstance[this.activeChain].accounts();
  }

  async currentAccount(): Promise<string | null> {
    return this.predicatesInstance[this.activeChain].currentAccount();
  }

  async signMessage(address: string, message: string): Promise<string> {
    return this.predicatesInstance[this.activeChain].signMessage(
      address,
      message,
    );
  }

  async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<string> {
    return this.predicatesInstance[this.activeChain].sendTransaction(
      address,
      transaction,
    );
  }

  async assets(): Promise<Array<Asset>> {
    return this.predicatesInstance[this.activeChain].assets();
  }

  async addAsset(asset: Asset): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].addAsset(asset);
  }

  async addAssets(assets: Asset[]): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].addAssets(assets);
  }

  async addAbi(contractId: string, abi: FuelABI): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].addAbi(contractId, abi);
  }

  async getABI(contractId: string): Promise<FuelABI> {
    return this.predicatesInstance[this.activeChain].getAbi(contractId);
  }

  async hasABI(contractId: string): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].hasAbi(contractId);
  }

  async currentNetwork(): Promise<Network> {
    return this.predicatesInstance[this.activeChain].currentNetwork();
  }

  async selectNetwork(network: SelectNetworkArguments): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].selectNetwork(network);
  }

  async networks(): Promise<Network[]> {
    return this.predicatesInstance[this.activeChain].networks();
  }

  async addNetwork(networkUrl: string): Promise<boolean> {
    return this.predicatesInstance[this.activeChain].addNetwork(networkUrl);
  }

  async version(): Promise<Version> {
    return this.predicatesInstance[this.activeChain].version();
  }

  /**
   * ============================================================
   * Predicate Utilities
   * ============================================================
   */
  // @TODO: Put back solana fuel predicate address
  // Receive address + chain name (ethereum or solana)
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
