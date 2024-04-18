import type { Provider as FuelProvider, StorageAbstract } from 'fuels';

export type BurnerWalletConfig = {
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
  storage?: StorageAbstract;
};
