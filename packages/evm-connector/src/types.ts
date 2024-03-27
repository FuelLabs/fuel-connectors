import type { Provider } from 'fuels';
import type { EIP1193Provider } from './utils/eip-1193';

export type EVMWalletConnectorConfig = {
  fuelProvider?: Provider | string;
  ethProvider?: EIP1193Provider;
};
