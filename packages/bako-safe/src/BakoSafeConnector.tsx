import {
  type Asset,
  type FuelABI,
  FuelConnector,
  FuelConnectorEventTypes,
  type Network,
  Provider,
  type StorageAbstract,
  transactionRequestify,
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
  SOCKET_URL
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
  private username?: string;

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

  /**
   * [important]
   * this.socket.emit -> emit message to the server
   * this.emit -> emit message to the dApp client
   */

  private async setup() {
    if (!HAS_WINDOW) return;
    if (this.setupReady) return;
    this.setupReady = true;
    const sessionId = await this.getSessionId();
    this.socket = io(SOCKET_URL, {
      auth: {
        username: '[CONNECTOR]',
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
    this.username = `[CONNECTOR]`;

    this.socket?.on(this.events.DEFAULT, ({data}) => {
      console.log('[CONNECTOR]: RECEBIDO', data)
      // const { type, to, ...rest } = data;
      // console.log(data, type, to, ...rest)
      if(data.to === this.username){
        console.log('[IF_MIDDLEWARE]', {
          evento: data.type,
          data: {
            ...data.data,
            from: data.to,
          },
        })
        this.emit(data.type, {
          from: data.to,
          data: data.data,
        });
      }
    });
  }

  // ============================================================
  // Connector methods
  // ============================================================
  async connect() {
    return new Promise<boolean>((resolve) => {
      const cred = crypto.randomUUID()
      this.dAppWindow?.open('/');

      // @ts-ignore
      this.on('[AUTH_CONFIRMED]', (data) => {
        console.log('[AUTH_CONFIRMED]', data)
        // if(data.id === cred){
        // }
        const { connected } = data;
        this.connected = connected;
        resolve(connected);
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
    console.log('[SEND_TX_CALLED]')
    return new Promise<string>(async (resolve, reject) => {
      this.dAppWindow?.open('/dapp/transaction')
      // @ts-ignore
      this.on('[CONNECTED_RESOURCE]', (data) => {
        console.log('[CONNECTED_RESOURCE]', data)
        this.off('[TX_EVENT_REQUEST]', () => {})
        this.socket?.emit('[TX_EVENT_REQUEST]', {
          _transaction,
          _address,
        })
      })

      // @ts-ignore
      this.on('[TX_EVENT_CONFIRMED]', ({data}) => {
        this.off('[TX_EVENT_REQUEST]', () => {})
        console.log('[RESULTADO_TX]', data)
        // @ts-ignore
        console.log('[RESPOSTA]: ', `0x${data.id}`)
        this.dAppWindow?.close();
        // @ts-ignore
        resolve(`0x${data.id}`)
      })
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
    //this request goes to the api without sessionId
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
    //nao necessário esperar mensagens
    await this.api.delete(`/connections/${this.sessionId}`);
    this.emit(this.events.CONNECTION, false);
    this.emit(this.events.ACCOUNTS, []);
    this.emit(this.events.CURRENT_ACCOUNT, null);
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
