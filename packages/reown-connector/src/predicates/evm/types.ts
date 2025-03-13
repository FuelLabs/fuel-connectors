import type { PredicateConfig } from '@fuel-connectors/common';
import type { AppKit } from '@reown/appkit';
import type { Provider as FuelProvider, StorageAbstract } from 'fuels';

export type PredicateEvmConfig = {
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
  projectId?: string;
  appkit: AppKit;
  predicateConfig?: PredicateConfig;
  storage?: StorageAbstract;
  chainId?: number;
};
