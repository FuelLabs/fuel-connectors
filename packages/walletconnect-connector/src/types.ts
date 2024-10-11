import type { PredicateConfig } from '@fuel-connectors/common';
import type { Metadata } from '@reown/appkit';
import type { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type { Config as WagmiConfig } from '@wagmi/core';
import type { Provider as FuelProvider, StorageAbstract } from 'fuels';

export type AppKitConfig = {
  metadata?: Metadata;
  wagmiAdapter?: WagmiAdapter;
};
export type WalletConnectConfig = {
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
  projectId?: string;
  appKit?: AppKitConfig;
  predicateConfig?: PredicateConfig;
  storage?: StorageAbstract;
  chainId?: number;
};
