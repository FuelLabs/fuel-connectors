import type { PredicateConfig } from '@fuel-connectors/common';
import type { AppKit } from '@reown/appkit';
import type { Provider as FuelProvider } from 'fuels';

export type PredicateSvmConfig = {
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
  projectId?: string;
  predicateConfig?: PredicateConfig;
  appkit: AppKit;
  chainId?: number;
};
