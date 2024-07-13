import {
  Address,
  type B256Address,
  Predicate as FuelPredicate,
  type InputValue,
  type JsonAbi,
  type Provider,
  arrayify,
  getPredicateRoot,
} from 'fuels';

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
}

const convertAddress = (address: string): string => {
  return Address.fromEvmAddress(address).toB256();
};

export const getPredicateAddresses = (
  addresses: string[],
  predicate: Predicate,
): string[] => {
  return addresses.map((address) => getPredicateAddress(address, predicate));
};

export const getPredicateAddress = (
  address: string | B256Address,
  predicate: Predicate,
): string => {
  // @ts-expect-error processPredicateData is only available in the Predicate class
  const { predicateBytes } = FuelPredicate.processPredicateData(
    predicate.bytecode,
    predicate.abi,
    {
      SIGNER: convertAddress(address),
    },
  );
  return Address.fromB256(getPredicateRoot(predicateBytes)).toString();
};

export const build = <T extends InputValue[]>(
  address: string,
  predicate: Predicate,
  provider: Provider,
  inputData?: T,
) =>
  new FuelPredicate({
    bytecode: arrayify(predicate.bytecode),
    abi: predicate.abi,
    provider,
    configurableConstants: {
      SIGNER: convertAddress(address),
    },
    inputData,
  });
