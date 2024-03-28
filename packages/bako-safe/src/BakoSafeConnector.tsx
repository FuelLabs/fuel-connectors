import {
  type Asset,
  type FuelABI,
  FuelConnector,
  FuelConnectorEventTypes,
  type Network,
  Provider,
  type StorageAbstract,
  type TransactionRequestLike,
} from 'fuels';
import { type Socket, io } from 'socket.io-client';

import { DAppWindow } from './DAPPWindow';
import {
  APP_DESCRIPTION,
  APP_IMAGE_DARK,
  APP_IMAGE_LIGHT,
  APP_NAME,
  APP_URL,
  HAS_WINDOW,
  HOST_URL,
  WINDOW,
} from './constants';
import { RequestAPI } from './request';
import { BAKOSAFEConnectorEvents, type BakoSafeConnectorConfig } from './types';

export class BakoSafeConnector extends FuelConnector {
  name = APP_NAME;
  metadata = {
    image: {
      light: APP_IMAGE_LIGHT,
      dark: APP_IMAGE_DARK,
    },
    install: {
      action: APP_URL,
      link: APP_URL,
      description: APP_DESCRIPTION,
    },
  };
  installed = true;
  connected = false;

  events = {
    ...FuelConnectorEventTypes,
    ...BAKOSAFEConnectorEvents,
  };

  private readonly appUrl: string;
  private readonly host: string;
  private readonly api: RequestAPI;
  private setupReady?: boolean;
  private socket?: Socket;
  private sessionId?: string;
  private dAppWindow?: DAppWindow;
  private storage?: StorageAbstract;

  constructor(config?: BakoSafeConnectorConfig) {
    super();
    this.host = config?.host ?? HOST_URL;
    this.appUrl = config?.appUrl ?? APP_URL;
    this.api = new RequestAPI(this.host);
    this.storage = this.getStorage(config?.stroage);
  }

  // ============================================================
  // Bako Safe application specific methods
  // ============================================================
  private getStorage(storage?: StorageAbstract) {
    const _storage =
      storage ?? (WINDOW.localStorage as unknown as StorageAbstract);
    if (!_storage) {
      throw new Error('No storage provided');
    }

    return _storage;
  }

  private async getSessionId() {
    let sessionId: string = (await this.storage?.getItem('sessionId')) || '';
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      await this.storage?.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private async setup() {
    if (!HAS_WINDOW) return;
    if (this.setupReady) return;
    this.setupReady = true;
    const sessionId = await this.getSessionId();
    this.socket = io(this.host, {
      auth: {
        username: `[WALLET]${sessionId}`,
        data: new Date(),
        sessionId: sessionId,
        origin: window.origin,
      },
      autoConnect: false,
    });
    this.dAppWindow = new DAppWindow({
      sessionId,
      height: 800,
      width: 450,
      appUrl: this.appUrl,
    });
    this.socket.connect();
    this.sessionId = sessionId;
  }

  // ============================================================
  // Connector methods
  // ============================================================
  async connect() {
    return new Promise<boolean>((resolve) => {
      this.socket?.on(BAKOSAFEConnectorEvents.DEFAULT, (message) => {
        this.emit(message.type, ...message.data);
      });

      const dappWindow = this.dAppWindow?.open('/');
      dappWindow?.addEventListener('close', () => {
        resolve(false);
      });

      // @ts-ignore
      this.on(BAKOSAFEConnectorEvents.CONNECTION, (connection: boolean) => {
        this.connected = connection;
        resolve(connection);
      });
    });
  }

  /*
   * @param {string} address - The address to sign the transaction
   * @param {Transaction} transaction - The transaction to send
   *
   * @returns {string} - The transaction id
   */
  async sendTransaction(
    _address: string,
    _transaction: TransactionRequestLike,
  ) {
    return new Promise<string>((resolve, reject) => {
      const dappWindow = this.dAppWindow?.open('/dapp/transaction');
      dappWindow?.addEventListener('close', () => {
        reject('closed');
      });
      // @ts-ignore
      this.on(BAKOSAFEConnectorEvents.POPUP_TRANSFER, () => {
        this.socket?.emit(BAKOSAFEConnectorEvents.TRANSACTION_SEND, {
          to: `${this.sessionId}:${window.origin}`,
          content: {
            address: _address,
            transaction: _transaction,
          },
        });
      });
      // @ts-ignore
      this.on(BAKOSAFEConnectorEvents.TRANSACTION_CREATED, (content) => {
        resolve(`0x${content}`);
      });
    });
  }

  async ping() {
    await this.setup();
    return !!this.socket;
  }

  async version() {
    return {
      app: '0.0.0',
      network: '0.0.0',
    };
  }

  async isConnected() {
    const data = await this.api.get(`/connections/${this.sessionId}/state`);
    this.connected = data;

    return data && !!this.socket;
  }

  async accounts() {
    const data = await this.api.get(`/connections/${this.sessionId}/accounts`);

    const acc = Array.isArray(data) ? data : [];
    return acc;
  }

  async currentAccount() {
    const data = await this.api.get(
      `/connections/${this.sessionId}/currentAccount`,
    );
    return data;
  }

  async disconnect() {
    this.socket?.emit(BAKOSAFEConnectorEvents.AUTH_DISCONECT_DAPP, {
      to: `${this.sessionId}:${window.origin}`,
      content: {
        sessionId: this.sessionId,
      },
    });
    this.emit(BAKOSAFEConnectorEvents.CONNECTION, false);
    this.emit(BAKOSAFEConnectorEvents.ACCOUNTS, []);
    this.emit(BAKOSAFEConnectorEvents.CURRENT_ACCOUNT, null);
    return false;
  }

  async currentNetwork() {
    const data = await this.api.get(
      `/connections/${this.sessionId}/currentNetwork`,
    );

    const provider = await Provider.create(data);

    return {
      url: provider.url,
      chainId: provider.getChainId(),
    };
  }

  async networks(): Promise<Array<Network>> {
    return [await this.currentNetwork()];
  }

  async assets(): Promise<Asset[]> {
    return [];
  }

  async signMessage(_address: string, _message: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async addAssets(_assets: Asset[]): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async addAsset(_assets: Asset): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async addNetwork(_networkUrl: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async selectNetwork(_network: Network): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async addABI(_contractId: string, _abi: FuelABI): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async getABI(_id: string): Promise<FuelABI | null> {
    throw new Error('Method not implemented.');
  }

  async hasABI(_id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
