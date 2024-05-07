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

interface PredicateTypeComponents {
  name: string;
  type: number;
  typeArguments: null;
}

export interface Predicate {
  predicate: {
    abi: {
      types: {
        typeId: number;
        type: string;
        components: PredicateTypeComponents[] | null;
        typeParameters: null;
      }[];
      functions: {
        inputs: {
          name: string;
          type: number;
          typeArguments: null;
        }[];
        name: string;
        output: {
          name: string;
          type: number;
          typeArguments: null;
        };
        attributes: null;
      }[];
      loggedTypes: never[];
      messagesTypes: never[];
      configurables: {
        name: string;
        configurableType: {
          name: string;
          type: number;
          typeArguments: never[];
        };
        offset: number;
      }[];
    };
    bytecode: Uint8Array;
  };
  generatedAt: number;
}
