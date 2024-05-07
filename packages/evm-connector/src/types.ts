import type { JsonAbi, Provider } from 'fuels';
import type { EIP1193Provider } from './utils/eip-1193';

export type EVMWalletConnectorConfig = {
  fuelProvider?: Provider | Promise<Provider>;
  ethProvider?: EIP1193Provider;
  predicateConfig?: PredicateConfig;
};

export interface PredicateConfig {
  abi: JsonAbi;
  bytecode: Uint8Array;
}

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

export enum EVMWalletConnectorEvents {
  //accounts
  ACCOUNTS_CHANGED = 'accountsChanged',

  //connections
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
}
