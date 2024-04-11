import type { Config as WagmiConfig } from '@wagmi/core';
import type { Provider as FuelProvider, JsonAbi } from 'fuels';

export interface PredicateConfig {
  abi: JsonAbi;
  bytecode: Uint8Array;
}

export type WalletConnectConfig = {
  fuelProvider?: FuelProvider | Promise<FuelProvider>;
  projectId?: string;
  wagmiConfig?: WagmiConfig;
  predicateConfig?: PredicateConfig;
};
