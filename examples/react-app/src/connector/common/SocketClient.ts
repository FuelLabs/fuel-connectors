import type { EventEmitter } from 'node:events';
import { type Socket, io } from 'socket.io-client';

// Configuration constants
export const SOCKET_URL = 'https://api.bako.global';
export const APP_URL = 'https://safe.bako.global';

// Environment detection
export const HAS_WINDOW = typeof window !== 'undefined';
export const WINDOW: Window | Record<string, never> = HAS_WINDOW ? window : {};

// Event types for Bako Safe communication
export enum BakoSafeConnectorEvents {
  // Default events
  DEFAULT = 'message',

  // Client events
  CLIENT_DISCONNECTED = '[CLIENT_DISCONNECTED]',
  CLIENT_CONNECTED = '[CONNECTED]',

  // Transaction events
  TX_PENDING = '[TX_EVENT_REQUESTED]',
  TX_CONFIRMED = '[TX_EVENT_CONFIRMED]',
  TX_TIMEOUT = '[TX_EVENT_TIMEOUT]',

  // Network events
  CHANGE_NETWORK = '[CHANGE_NETWORK]',
  NETWORK_CHANGED = '[NETWORK_CHANGED]',

  // Authentication events
  AUTH_CONFIRMED = '[AUTH_CONFIRMED]',

  // Connection events
  CONNECTION_STATE = '[CONNECTION_STATE]',
  DISCONNECT = '[DISCONNECT]',
}

// Username identifiers for different components
export enum BakoSafeUsernames {
  CONNECTOR = '[CONNECTOR]',
  CLIENT = '[UI]',
  SERVER = '[API]',
}

// Type definitions
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
  _transaction: unknown; // TransactionRequestLike from fuels
  _address: string;
}

export interface IResponseTxConfirmed {
  id: string;
}

export interface IResponseAuthConfirmed {
  connected: boolean;
}

// Default socket authentication configuration
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

  // Connection state
  private isConnecting = false;

  // Public properties
  public server: Socket;
  public events: EventEmitter;
  public requestId: string;

  private constructor({ sessionId, events }: ICreateClientSocket) {
    this.requestId = crypto.randomUUID();
    this.events = events;

    // Initialize socket connection
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

  // ============================================================
  // Private helper methods
  // ============================================================

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

    // Message handling
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
