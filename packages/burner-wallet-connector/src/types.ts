import type { Provider as FuelProvider, StorageAbstract } from 'fuels';

export type BurnerWalletConfig = {
  // @deprecated inform `fuelProvider` in root config instead of in burner wallet config
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
  storage?: StorageAbstract;
  chainId?: number;
};
