import type { EIP1193Provider, PredicateConfig } from '@fuel-connectors/common';
import type { Provider } from 'fuels';

export type EVMWalletConnectorConfig = {
  fuelProvider?: Provider | Promise<Provider>;
  ethProvider?: EIP1193Provider;
  predicateConfig?: PredicateConfig;
  chainId?: number;
};

export enum EVMWalletConnectorEvents {
  //accounts
  ACCOUNTS_CHANGED = 'accountsChanged',

  //connections
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
}
export interface SignatureData {
  message: string;
  signature: string;
}
