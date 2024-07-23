import type { Config as WagmiConfig } from '@wagmi/core';
import type { Web3Modal } from '@web3modal/wagmi';
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
  web3Modal: Web3Modal;
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
          typeArguments: never[] | null;
        };
        offset: number;
      }[];
    };
    bytecode: Uint8Array;
  };
  generatedAt: number;
}
