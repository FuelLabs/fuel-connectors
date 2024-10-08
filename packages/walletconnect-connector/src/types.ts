import type { PredicateConfig } from '@fuel-connectors/common';
import type { Config as WagmiConfig } from '@wagmi/core';
import type { Provider as FuelProvider, StorageAbstract } from 'fuels';

export type WalletConnectConfig = {
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
  projectId?: string;
  wagmiConfig?: WagmiConfig;
  predicateConfig?: PredicateConfig;
  storage?: StorageAbstract;
  chainId?: number;
};
