import type EventEmitter from 'node:events';
import type { PredicateConfig } from '@fuel-connectors/common';
import type { Provider } from 'fuels';

export type EVMWalletConnectorConfig = {
  fuelProvider?: Provider | Promise<Provider>;
  ethProvider?: EIP1193Provider;
  predicateConfig?: PredicateConfig;
};

export enum EVMWalletConnectorEvents {
  //accounts
  ACCOUNTS_CHANGED = 'accountsChanged',

  //connections
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
}

export interface EIP1193Provider extends EventEmitter {
  request(args: {
    method: string;
    params?: unknown[];
  }): Promise<unknown | unknown[]>;
}
