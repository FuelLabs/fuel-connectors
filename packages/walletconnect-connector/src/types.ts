import type { Config as WagmiConfig } from '@wagmi/core';
import type { Provider as FuelProvider, JsonAbi } from 'fuels';

export interface PredicateConfig {
  abi: JsonAbi;
  bytecode: Uint8Array;
}

export type WalletConnectConfig = {
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
  projectId?: string;
  wagmiConfig?: WagmiConfig;
  predicateConfig?: PredicateConfig;
};

export enum WalletConnectConnectorEvents {
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
