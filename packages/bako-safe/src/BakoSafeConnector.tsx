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
import { SocketClient } from './SocketClient';

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
  private socket?: SocketClient;
  private sessionId?: string;
  private dAppWindow?: DAppWindow;
  private storage?: StorageAbstract;

  constructor(config?: BakoSafeConnectorConfig) {
    super();
    this.host = config?.host ?? HOST_URL;
    this.appUrl = config?.appUrl ?? APP_URL;
    this.api = new RequestAPI(this.host);
    this.storage = this.getStorage(config?.stroage);
    this.setupReady = false;
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

  private checkWindow() {
    // timeout to open
    const open_interval = setInterval(() => {
      const isOpen = this.dAppWindow?.isOpen;
      if(!isOpen) {
        this.emit('[CLIENT_DISCONNECTED]', {});
        clearInterval(open_interval);
      }
    }, 2000);
    // safari browser does not support window.opener
    if(this.dAppWindow?.isSafariBrowser) return;
    
    // timeout to close
    const interval = setInterval(() => {
      const isOpen = this.dAppWindow?.opned && this.dAppWindow?.opned.closed;
      if(isOpen) {
        this.emit('[CLIENT_DISCONNECTED]', {});
        clearInterval(interval);
      }
    }, 300);
  }

  

  /**
   * [important]
   * this.socket.emit -> emit message to the server
   * this.emit -> emit message to the dApp client
   */

  private async setup() {
      if (!HAS_WINDOW) return;
      if (this.setupReady) return;
      const sessionId = await this.getSessionId();
  
      this.sessionId = sessionId;
  
      this.socket = new SocketClient({
        sessionId,
        events: this,
      });
      
      this.dAppWindow = new DAppWindow({
        sessionId,
        height: 800,
        width: 450,
        appUrl: this.appUrl,
        request_id: this.socket.request_id,
      });
      
      this.setupReady = true;
  }

  // ============================================================
  // Connector methods
  // ============================================================
  async connect() {
    return new Promise<boolean>(async (resolve, reject) => {
      // some browsers don't find the connection via ping, in others it doesn't work so well
      const is_connected = await this.isConnected();
      if(is_connected){
        resolve(true)
        return;
      }

      const request = '[AUTH_CONFIRMED]'
      const connect_cancel = '[CLIENT_DISCONNECTED]'

      // window controll
      this.dAppWindow?.open('/', reject)
      this.checkWindow()

      
      //events controll
      // @ts-ignore
      this.socket?.events.on(connect_cancel, () => { // cancel the transaction
        this.dAppWindow?.close()
        this.off(connect_cancel, () => {})
        reject
      })
      // @ts-ignore
      this.socket?.events.on(request, async (data) => {
        this.socket?.events.off(request, () => {})
        this.dAppWindow?.close()
        this.emit(this.events.CONNECTION, data)
        this.emit(this.events.ACCOUNTS, await this.accounts())
        this.emit(this.events.CURRENT_ACCOUNT, await this.currentAccount())

        resolve(true)
      })
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
    return new Promise<string>(async (resolve, reject) => {
      const connect_confirm = '[CONNECTED]'
      const connect_cancel = '[CLIENT_DISCONNECTED]'
      const request_tx_pending = '[TX_EVENT_REQUEST]'
      const request_tx_confirm = '[TX_EVENT_CONFIRMED]'

      // window controll
      this.dAppWindow?.open('/dapp/transaction', reject)
      this.checkWindow()

      //events controll
      // @ts-ignore
      this.socket?.events.on(connect_cancel, () => { // cancel the transaction
        this.dAppWindow?.close()
        this.off(connect_cancel, () => {})
        reject()
      })
      
      // @ts-ignore
      this.socket?.events.on(connect_confirm, () => { // confirm bako ui connection
        this.off(connect_confirm, () => {})
        this.socket?.server.emit(request_tx_pending, {
          _transaction,
          _address,
        })

        // @ts-ignore
        this.socket?.events.on(request_tx_confirm, ({data}) => { // confirm the transaction
          this.off(request_tx_pending, () => {})
          this.dAppWindow?.close();
          // @ts-ignore 
          resolve(`0x${data.id}`)
        })
        
      })
    });
  }

  async ping() {
    await this.setup();
    return this.setupReady ?? false;
  }

  async version() {
    return {
      app: '0.0.0',
      network: '0.0.0',
    };
  }

  async isConnected() {
    //this request goes to the api without sessionId
    const sessionId = this.sessionId ?? (await this.getSessionId());
    const data = await this.api.get(`/connections/${sessionId}/state`);

    this.connected = data;

    return data;
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
