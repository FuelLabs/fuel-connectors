import axios, { type AxiosInstance } from 'axios';
import {
  type Asset,
  FuelConnector,
  FuelConnectorEventTypes,
  type JsonAbi,
  type TransactionRequestLike,
} from 'fuels';
import { type Socket, io } from 'socket.io-client';

import { DAppWindow } from './DAPPWindow';
import { BAKOSAFEConnectorEvents } from './types';

const APP_NAME = 'Bsafe';
const APP_DESCRIPTION =
  'BSafe is a connector to app.bsafe.pro, a non-custodial vault for your crypto assets.';
const APP_IMAGE_DARK = 'https://app.bsafe.pro/assets/logo-294a5e40.svg';
const APP_IMAGE_LIGHT = 'https://app.bsafe.pro/assets/logoDark-97c52b43.svg';

const APP_BSAFE_URL = 'https://app.bsafe.pro/';
const API_URL = 'https://api-multsig.infinitybase.com';

type FuelABI = JsonAbi;
type Network = {
  url: string;
  chainId: number;
};

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

  private readonly socket: Socket;
  private readonly sessionId: string;
  private readonly api: AxiosInstance = axios.create({
    baseURL: API_URL,
  });
  private dAppWindow: DAppWindow;

  constructor() {
    super();
    let sessionId: string = localStorage.getItem('sessionId') || '';
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('sessionId', sessionId);
    }

    this.sessionId = sessionId;

    this.socket = io(API_URL, {
      auth: {
        username: `${'[WALLET]'}`,
        data: new Date(),
        sessionId: this.sessionId,
        origin: window.origin,
      },
    });

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

    this.socket.on(BAKOSAFEConnectorEvents.DEFAULT, (message) => {
      this.emit(message.type, ...message.data);
    });
  }

  async connect() {
    return new Promise<boolean>((resolve) => {
      const dappWindow = this.dAppWindow.open('/');
      dappWindow?.addEventListener('close', () => {
        resolve(false);
      });

      // @ts-ignore
      this.on(BSAFEConnectorEvents.CONNECTION, (connection: boolean) => {
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
      this.on(BSAFEConnectorEvents.POPUP_TRANSFER, () => {
        this.socket.emit(BAKOSAFEConnectorEvents.TRANSACTION_SEND, {
          to: `${this.sessionId}:${window.origin}`,
          content: {
            address: _address,
            transaction: _transaction,
          },
        });
      });
      // @ts-ignore
      this.on(BSAFEConnectorEvents.TRANSACTION_CREATED, (content) => {
        resolve(`0x${content}`);
      });
    });
  }

  async ping() {
    return true;
  }

  //todo: make a file on sdk, to return this object
  async version() {
    return {
      app: '0.0.1',
      network: '>=0.12.4',
    };
  }

  async isConnected() {
    const { data } = await this.api.get(`/connections/${this.sessionId}/state`);

    return data;
  }

  async accounts() {
    const { data } = await this.api.get(
      `/connections/${this.sessionId}/accounts`,
    );
    return data;
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
    return data;
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
  async networks(): Promise<Array<Network>> {
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
