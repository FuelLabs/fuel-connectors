import type { Provider as FuelProvider } from 'fuels';

export type EthereumWalletConnectorConfig = {
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
  ethProvider?: unknown | Promise<unknown>;
};

export enum EthereumWalletConnectorEvents {
  //accounts
  ACCOUNTS_CHANGED = 'accountsChanged',

  //chain
  CHAIN_CHANGED = 'chainChanged',

  //session
  SESSION_EVENT = 'session_event',

  //connection uri
  DISPLAY_URI = 'display_uri',

  //connections
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
}
