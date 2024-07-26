import type { AbstractAddress, JsonAbi } from 'fuels';

export type Connector = {
  name: string;
  image:
    | string
    | {
        light: string;
        dark: string;
      };
  connector: string;
  install: {
    action: string;
    link: string;
    description: string;
  };
  installed: boolean;
};

export type ConnectorList = Array<Connector>;

type JsonAbiArgument = JsonAbi['functions'][number]['inputs'][number];
type JsonAbiType = JsonAbi['types'][number];

type GetAbiTypeById<TAbi extends JsonAbi, Id extends number> = Extract<
  TAbi['types'][number],
  { typeId: Id }
>;

type ExtractTypeFromString<
  TAbi extends JsonAbi,
  T extends string,
> = T extends `str[${infer _Length}]`
  ? string
  : T extends `[${infer Item}; ${infer _Length}]`
    ? ResolveAbiType<
        TAbi,
        GetAbiTypeById<TAbi, ExtractTypeIdFromString<Item>>
      >[]
    : T extends `struct ${infer Name}`
      ? { [K in Name]: unknown }
      : T extends `enum ${infer Name}`
        ? { [K in Name]: unknown }
        : T extends `(${infer Items})`
          ? [ExtractTypeFromString<TAbi, Items>]
          : T extends `generic ${infer _Name}`
            ? unknown
            : unknown;

type ResolveEnumType<
  TAbi extends JsonAbi,
  T extends JsonAbiType,
> = T['components'] extends { type: infer TypeId }
  ? TypeId extends number
    ? ResolveAbiType<TAbi, GetAbiTypeById<TAbi, TypeId>>
    : unknown
  : unknown;

type ResolveAbiType<
  TAbi extends JsonAbi,
  T extends JsonAbiType,
> = T['type'] extends 'struct'
  ? T['components'] extends null
    ? unknown
    : {
        [K in NonNullable<
          T['components']
        >[number] as K['name']]: ResolveAbiType<
          TAbi,
          GetAbiTypeById<TAbi, K['type']>
        >;
      }
  : T['type'] extends 'enum'
    ? ResolveEnumType<TAbi, T>
    : T['type'] extends 'u64' | 'u256' | 'uint256'
      ? bigint
      : T['type'] extends 'u32' | 'u16' | 'u8'
        ? number
        : T['type'] extends 'bool'
          ? boolean
          : T['type'] extends 'b256' | `str[${string}]`
            ? string
            : T['type'] extends 'struct Address' | 'struct ContractId'
              ? AbstractAddress
              : T['type'] extends '()'
                ? unknown
                : T['type'] extends `array<${infer U}>`
                  ? ResolveAbiType<
                      TAbi,
                      GetAbiTypeById<TAbi, ExtractTypeIdFromString<U>>
                    >[]
                  : T['type'] extends `${string} ${string}`
                    ? ExtractTypeFromString<TAbi, T['type']>
                    : unknown;

type ExtractTypeIdFromString<S extends string> = S extends `${infer Id}`
  ? NumberStringToNumber<Id>
  : never;
type NumberStringToNumber<S extends string> = S extends `${infer D extends
  number}`
  ? D
  : never;

type ResolveInputs<
  TAbi extends JsonAbi,
  Inputs extends ReadonlyArray<JsonAbiArgument>,
> = Inputs['length'] extends 1
  ? ResolveAbiType<TAbi, GetAbiTypeById<TAbi, Inputs[0]['type']>>
  : {
      [K in keyof Inputs]: ResolveAbiType<
        TAbi,
        GetAbiTypeById<TAbi, Inputs[K]['type']>
      >;
    };

export type InputsForFunctionName<
  TAbi extends JsonAbi,
  N extends FunctionNames<TAbi>,
> = ResolveInputs<
  TAbi,
  Extract<TAbi['functions'][number], { name: N }>['inputs']
>;

export type FunctionNames<TAbi extends JsonAbi> =
  TAbi['functions'][number]['name'];
