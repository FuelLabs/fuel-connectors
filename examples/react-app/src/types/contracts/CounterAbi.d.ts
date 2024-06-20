/* Autogenerated file. Do not edit manually. */

/* tslint:disable */
/* eslint-disable */

/*
  Fuels version: 0.88.1
  Forc version: 0.59.0
  Fuel-Core version: 0.26.0
*/

import type {
  BigNumberish,
  BN,
  BytesLike,
  Contract,
  DecodedValue,
  FunctionFragment,
  Interface,
  InvokeFunction,
} from 'fuels';

interface CounterAbiInterface extends Interface {
  functions: {
    get_count: FunctionFragment;
    increment_counter: FunctionFragment;
  };

  encodeFunctionData(functionFragment: 'get_count', values: []): Uint8Array;
  encodeFunctionData(functionFragment: 'increment_counter', values: []): Uint8Array;

  decodeFunctionData(functionFragment: 'get_count', data: BytesLike): DecodedValue;
  decodeFunctionData(functionFragment: 'increment_counter', data: BytesLike): DecodedValue;
}

export class CounterAbi extends Contract {
  interface: CounterAbiInterface;
  functions: {
    get_count: InvokeFunction<[], BN>;
    increment_counter: InvokeFunction<[], BN>;
  };
}
