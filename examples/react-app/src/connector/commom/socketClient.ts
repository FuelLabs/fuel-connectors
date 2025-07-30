import { type Socket, io } from "socket.io-client";
import { EventEmitter } from "events";

// import type { BakoSafeConnector } from "./BakoSafeConnector";
// import { APP_URL, SOCKET_URL } from "./constants";
// import { WINDOW } from "./constants";
export const SOCKET_URL = "https://api.bako.global";
export const APP_URL = "https://safe.bako.global";

export const HAS_WINDOW = typeof window !== "undefined";
export const WINDOW: any = HAS_WINDOW ? window : {};
// import {
//   BakoSafeConnectorEvents,
//   BakoSafeUsernames,
//   type ICreateClientSocket,
//   type IResponseAuthConfirmed,
//   type IResponseTxCofirmed,
//   type ISocketAuth,
//   type ISocketMessage,
// } from "./types";

import type { TransactionRequestLike } from "fuels";
// import type { BakoSafeConnector } from "./BakoSafeConnector";
// import type { RequestAPI } from "./request";

export enum BakoSafeConnectorEvents {
  //default
  DEFAULT = "message",

  //client
  CLIENT_DISCONNECTED = "[CLIENT_DISCONNECTED]",
  CLIENT_CONNECTED = "[CONNECTED]",

  //transactions
  TX_PENDING = "[TX_EVENT_REQUESTED]",
  TX_CONFIRMED = "[TX_EVENT_CONFIRMED]",
  TX_TIMEOUT = "[TX_EVENT_TIMEOUT]",

  //switchNetwork
  CHANGE_NETWORK = "[CHANGE_NETWORK]",
  NETWORK_CHANGED = "[NETWORK_CHANGED]",

  //auth
  AUTH_CONFIRMED = "[AUTH_CONFIRMED]",

  CONNECTION_STATE = "[CONNECTION_STATE]",
  DISCONNECT = "[DISCONNECT]",
}

export enum BakoSafeUsernames {
  CONNECTOR = "[CONNECTOR]",
  CLIENT = "[UI]",
  SERVER = "[API]",
}

export interface ISocketAuth {
  username: string;
  data: Date;
  origin: string;
  sessionId: string;
}

export interface ISocketMessage<T> {
  username: BakoSafeUsernames;
  room: string;
  to: BakoSafeUsernames;
  type: BakoSafeConnectorEvents;
  data: T;
}

export interface ICreateClientSocket {
  sessionId: string;
  events: EventEmitter;
}

export interface IRequestTxPending {
  _transaction: TransactionRequestLike;
  _address: string;
}

export interface IResponseTxCofirmed {
  id: string;
}

export interface IResponseAuthConfirmed {
  connected: boolean;
}

const DEFAULT_SOCKET_AUTH: Omit<ISocketAuth, "sessionId"> = {
  username: BakoSafeUsernames.CONNECTOR,
  data: new Date(),
  origin: WINDOW.origin ?? APP_URL,
};

export class SocketClient {
  private static instance: SocketClient | null = null;
  private connecting = false;
  server: Socket;
  events: EventEmitter;
  request_id: string;

  private constructor({ sessionId, events }: ICreateClientSocket) {
    this.request_id = crypto.randomUUID();

    this.server = io(SOCKET_URL, {
      auth: {
        ...DEFAULT_SOCKET_AUTH,
        sessionId,
        request_id: this.request_id,
      },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.server?.on(
      BakoSafeConnectorEvents.DEFAULT,
      (data: ISocketMessage<IResponseTxCofirmed | IResponseAuthConfirmed>) => {
        if (data.to === DEFAULT_SOCKET_AUTH.username) {
          this.events.emit(data.type, {
            from: data.username,
            data: data.data,
          });
        }
      }
    );

    this.events = events;
    this.setupEventListeners();
    this.connect();
  }

  private setupEventListeners(): void {
    this.server.on("connect", () => {
      this.connecting = false;
    });

    this.server.on("connect_error", () => {
      this.connecting = false;
    });

    this.server.on(
      BakoSafeConnectorEvents.DEFAULT,
      (data: ISocketMessage<IResponseTxCofirmed | IResponseAuthConfirmed>) => {
        if (data.to === DEFAULT_SOCKET_AUTH.username) {
          this.events.emit(data.type, {
            from: data.username,
            data: data.data,
          });
        }
      }
    );
  }

  static create(options: ICreateClientSocket) {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient(options);
    }

    return SocketClient.instance;
  }

  connect(): void {
    console.log("[SocketClient] connect");
    if (this.isConnected || this.connecting) return;

    this.connecting = true;
    this.server.connect();
  }

  get isConnected(): boolean {
    console.log("[SocketClient] isConnected", this.server.connected);
    return this.server.connected;
  }

  checkConnection(): void {
    if (this.isConnected || this.connecting) return;
    this.connect();
  }

  disconnect(): void {
    this.server.disconnect();
    this.connecting = false;
  }
}
