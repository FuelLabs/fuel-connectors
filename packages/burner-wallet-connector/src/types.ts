import type { Provider, WalletUnlocked } from 'fuels';

export type BurnerWalletConnectorConfig = {
  fuelProvider?: Provider | Promise<Provider>;
  burnerWalletProvider?: Provider | Promise<Provider>;
};

export enum BurnerWalletConnectorEvents {
  //accounts
  ACCOUNTS_CHANGED = 'accountsChanged',

  //connections
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
}
