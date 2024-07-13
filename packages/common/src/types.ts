import type EventEmitter from 'node:events';
import type { JsonAbi } from 'fuels';
export type Maybe<T> = T | undefined | null;
export type Option<T1, T2, T3 = string> = T1 | T2 | T3;
export type Hash = `0x${string}`;
export type MaybeAsync<T> = Promise<T> | T;

export interface PredicateConfig {
  abi: JsonAbi;
  bytecode: Uint8Array;
}

export interface PredicateTypeComponents {
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

export interface EIP1193Provider extends EventEmitter {
  request(args: {
    method: string;
    params?: unknown[];
  }): Promise<unknown | unknown[]>;
}
