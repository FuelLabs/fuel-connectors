import type EventEmitter from 'node:events';
import type { JsonAbi, Provider } from 'fuels';

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
          typeArguments: never[] | null;
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

export interface EIP1193Provider extends EventEmitter {
  request(args: {
    method: string;
    params?: unknown[];
  }): Promise<unknown | unknown[]>;
}
