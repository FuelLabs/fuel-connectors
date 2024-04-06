import {
  type AbiMap,
  type Asset,
  type ConnectorMetadata,
  FuelConnector,
  FuelConnectorEventTypes,
  type JsonAbi,
  type Network,
  type TransactionRequestLike,
  type Version,
  Provider,
} from 'fuels';
import { mainnet } from '@wagmi/core/chains';
import {
  type Web3Modal,
  createWeb3Modal,
  defaultWagmiConfig,
} from '@web3modal/wagmi';

import { ETHEREUM_ICON } from './utils/ethereum-icon';
import type { EVMWalletConnectorConfig } from './types';
import { type Config, reconnect } from '@wagmi/core';
import { BETA_5_URL } from './constants';

export class EthereumWalletConnector extends FuelConnector {
  name = 'Ethereum Wallets';
  metadata: ConnectorMetadata = {
    image: ETHEREUM_ICON,
    install: {
      action: 'Install',
      description: 'Install Ethereum Wallet to connect to Fuel',
      link: 'https://ethereum.org/en/wallets/find-wallet/',
    },
  };

  config: EVMWalletConnectorConfig = {};

  installed = false;
  connected = false;

  wagmiProjectId = '';

  ethConfig: Config | null = null;
  fuelProvider: Provider | null = null;

  events = {
    ...FuelConnectorEventTypes,
  };

  web3Modal: Web3Modal | null = null;

  constructor(config: EVMWalletConnectorConfig = {}) {
    super();

    this.configProviders(config);
  }

  async configProviders(config: EVMWalletConnectorConfig = {}) {
    const metadata = {
      name: 'Web3Modal',
      description: 'Web3Modal Example',
      url: 'http://localhost:5173', // origin must match your domain & subdomain.
      icons: ['https://avatars.githubusercontent.com/u/37784886'],
    };

    const chains = [mainnet] as const;
    this.ethConfig = defaultWagmiConfig({
      chains,
      projectId: this.wagmiProjectId,
      metadata,
    });

    reconnect(this.ethConfig);

    // 3. Create modal
    this.web3Modal = createWeb3Modal({
      wagmiConfig: this.ethConfig,
      projectId: this.wagmiProjectId,
      enableAnalytics: true, // Optional - defaults to your Cloud configuration
      enableOnramp: true, // Optional - false as default
    });

    this.config = Object.assign(config, {
      fuelProvider: config.fuelProvider || Provider.create(BETA_5_URL),
    });
  }

  /**
   * ============================================================
   * Application communication methods
   * ============================================================
   */

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

  async isConnected(): Promise<boolean> {
    return true;
  }

  async accounts(): Promise<Array<string>> {
    return [''];
  }

  async connect(): Promise<boolean> {
    if (!this.web3Modal) {
      throw new Error('Web3Modal not initialized');
    }

    if (!(await this.isConnected())) {
      this.web3Modal.open();
    }

    return this.connected;
  }

  async disconnect(): Promise<boolean> {
    if (await this.isConnected()) {
    }

    return false;
  }

  async signMessage(_address: string, _message: string): Promise<string> {
    throw new Error('A predicate account cannot sign messages');
  }

  async sendTransaction(
    address: string,
    transaction: TransactionRequestLike,
  ): Promise<string> {
    console.log({ address, transaction });

    return '';
  }

  async currentAccount(): Promise<string | null> {
    return '';
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
