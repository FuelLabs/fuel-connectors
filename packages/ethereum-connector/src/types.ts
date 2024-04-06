import type { Provider } from 'fuels';
import type { EIP1193Provider } from './utils/eip-1193';

export type EVMWalletConnectorConfig = {
  fuelProvider?: Provider | Promise<Provider>;
  ethProvider?: EIP1193Provider;
};

export enum EVMWalletConnectorEvents {
  //accounts
  ACCOUNTS_CHANGED = 'accountsChanged',

  //connections
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
}
