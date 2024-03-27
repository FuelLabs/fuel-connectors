import {
  type Asset,
  type FuelABI,
  FuelConnector,
  FuelConnectorEventTypes,
  type Network,
  Provider,
  type TransactionRequestLike,
} from 'fuels';
import { type Socket, io } from 'socket.io-client';

import { DAppWindow } from './DAPPWindow';
import {
  APP_BSAFE_URL,
  APP_DESCRIPTION,
  APP_IMAGE_DARK,
  APP_IMAGE_LIGHT,
  APP_NAME,
  HOST_URL,
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
      action: APP_BSAFE_URL,
      link: APP_BSAFE_URL,
      description: APP_DESCRIPTION,
    },
  };
  installed = true;
  connected = false;

  events = {
    ...FuelConnectorEventTypes,
    ...BAKOSAFEConnectorEvents,
  };

  private socket: Socket;
  private readonly sessionId: string;
  private readonly host: string;
  private readonly api: RequestAPI;
  private connnected = false;
  private dAppWindow: DAppWindow;

  constructor(config?: BakoSafeConnectorConfig) {
    super();
    this.host = config?.host ?? HOST_URL;
    this.api = new RequestAPI(this.host);
    let sessionId: string = localStorage.getItem('sessionId') || '';
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('sessionId', sessionId);
    }
    this.socket = io(this.host, {
      auth: {
        username: `[WALLET]${sessionId}`,
        data: new Date(),
        sessionId: sessionId,
        origin: window.origin,
      },
      autoConnect: false,
    });
    this.sessionId = sessionId;

    this.dAppWindow = new DAppWindow({
      sessionId,
      name: document.title,
      origin: window.origin,
      popup: {
        top: 0,
        left: 2560,
        width: 450,
        height: 1280,
      },
    });
  }

  async setup() {
    if (!this.connnected) {
      this.connnected = true;
      await this.socket.connect();
    }
  }

  async connect() {
    return new Promise<boolean>((resolve) => {
      this.socket.on(BAKOSAFEConnectorEvents.DEFAULT, (message) => {
        this.emit(message.type, ...message.data);
      });

      const dappWindow = this.dAppWindow.open('/');
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
      const dappWindow = this.dAppWindow.open('/dapp/transaction');
      dappWindow?.addEventListener('close', () => {
        reject('closed');
      });
      // @ts-ignore
      this.on(BAKOSAFEConnectorEvents.POPUP_TRANSFER, () => {
        this.socket.emit(BAKOSAFEConnectorEvents.TRANSACTION_SEND, {
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
    return true;
  }

  async version() {
    return {
      app: '0.0.0',
      network: '0.0.0',
    };
  }

  async isConnected() {
    const { data } = await this.api.get(`/connections/${this.sessionId}/state`);
    this.connected = data;

    return data && !!this.socket;
  }

  async accounts() {
    const { data } = await this.api.get(
      `/connections/${this.sessionId}/accounts`,
    );
    const acc = Array.isArray(data) ? data : [];
    return acc;
  }

  async currentAccount() {
    const { data } = await this.api.get(
      `/connections/${this.sessionId}/currentAccount`,
    );
    return data;
  }

  async disconnect() {
    this.socket.emit(BAKOSAFEConnectorEvents.AUTH_DISCONECT_DAPP, {
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
    const { data } = await this.api.get(
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
