import type { Provider as FuelProvider } from 'fuels';

export type BurnerWalletConfig = {
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
  privateKey?: string;
};
