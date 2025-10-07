import type { EventEmitter } from 'node:events';
import { type Socket, io } from 'socket.io-client';

export const SOCKET_URL = 'https://api.bako.global';
export const APP_URL = 'https://safe.bako.global';

export const HAS_WINDOW = typeof window !== 'undefined';
export const WINDOW: Window | Record<string, never> = HAS_WINDOW ? window : {};

export enum BakoSafeConnectorEvents {
  DEFAULT = 'message',
  CLIENT_DISCONNECTED = '[CLIENT_DISCONNECTED]',
  CLIENT_CONNECTED = '[CONNECTED]',
  TX_PENDING = '[TX_EVENT_REQUESTED]',
  TX_CONFIRMED = '[TX_EVENT_CONFIRMED]',
  TX_TIMEOUT = '[TX_EVENT_TIMEOUT]',
  CHANGE_NETWORK = '[CHANGE_NETWORK]',
  NETWORK_CHANGED = '[NETWORK_CHANGED]',
  AUTH_CONFIRMED = '[AUTH_CONFIRMED]',
  CONNECTION_STATE = '[CONNECTION_STATE]',
  DISCONNECT = '[DISCONNECT]',
}

export enum BakoSafeUsernames {
  CONNECTOR = '[CONNECTOR]',
  CLIENT = '[UI]',
  SERVER = '[API]',
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
  _transaction: unknown;
  _address: string;
}

export interface IResponseTxConfirmed {
  id: string;
}

export interface IResponseAuthConfirmed {
  connected: boolean;
}

const DEFAULT_SOCKET_AUTH: Omit<ISocketAuth, 'sessionId'> = {
  username: BakoSafeUsernames.CONNECTOR,
  data: new Date(),
  origin: WINDOW.origin ?? APP_URL,
};

/**
 * Socket client for real-time communication with Bako Safe API.
 * Handles WebSocket connections, authentication, and event forwarding.
 */
export class SocketClient {
  private static instance: SocketClient | null = null;
  private isConnecting = false;

  public server: Socket;
  public events: EventEmitter;
  public requestId: string;

  private constructor({ sessionId, events }: ICreateClientSocket) {
    this.requestId = crypto.randomUUID();
    this.events = events;

    this.server = io(SOCKET_URL, {
      auth: {
        ...DEFAULT_SOCKET_AUTH,
        sessionId,
        request_id: this.requestId,
      },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
    this.connect();
  }

  /**
   * Creates a singleton instance of SocketClient.
   */
  static create(options: ICreateClientSocket): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient(options);
    }
    return SocketClient.instance;
  }

  /**
   * Establishes connection to the socket server.
   */
  public connect(): void {
    console.log('[SocketClient] Connecting...');
    if (this.isConnected || this.isConnecting) return;

    this.isConnecting = true;
    this.server.connect();
  }

  /**
   * Checks if the socket is currently connected.
   */
  public get isConnected(): boolean {
    const connected = this.server.connected;
    console.log('[SocketClient] Connection status:', connected);
    return connected;
  }

  /**
   * Ensures connection is established if not already connected.
   */
  public checkConnection(): void {
    if (this.isConnected || this.isConnecting) return;
    this.connect();
  }

  /**
   * Disconnects from the socket server.
   */
  public disconnect(): void {
    this.server.disconnect();
    this.isConnecting = false;
  }

  /**
   * Sets up event listeners for socket events.
   */
  private setupEventListeners(): void {
    // Connection events
    this.server.on('connect', () => {
      this.isConnecting = false;
      console.log('[SocketClient] Connected successfully');
    });

    this.server.on('connect_error', () => {
      this.isConnecting = false;
      console.error('[SocketClient] Connection error');
    });

    this.server.on(
      BakoSafeConnectorEvents.DEFAULT,
      (data: ISocketMessage<IResponseTxConfirmed | IResponseAuthConfirmed>) => {
        if (data.to === DEFAULT_SOCKET_AUTH.username) {
          this.events.emit(data.type, {
            from: data.username,
            data: data.data,
          });
        }
      },
    );
  }
}
