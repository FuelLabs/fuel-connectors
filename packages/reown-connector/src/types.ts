import type {
  PredicateConfig,
  PredicateConnector,
} from '@fuel-connectors/common';
import type { AppKit } from '@reown/appkit';
import type { Provider as FuelProvider, StorageAbstract } from 'fuels';

export type ReownConnectorConfig = {
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
  projectId?: string;
  appkit: AppKit;
  predicateConfig?: PredicateConfig;
  storage?: StorageAbstract;
  chainId?: number;
};

export type ReownChain = 'ethereum' | 'solana';
export type PredicatesInstance = Record<ReownChain, PredicateConnector>;

export type GetFuelPredicateAddressesParams = {
  address: string;
  chain: ReownChain;
};
