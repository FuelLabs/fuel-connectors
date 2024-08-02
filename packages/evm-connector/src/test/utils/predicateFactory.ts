import {
  Address,
  type B256Address,
  type BytesLike,
  Predicate as FuelPredicate,
  type InputValue,
  type JsonAbi,
  type Provider,
  arrayify,
  getPredicateRoot,
} from 'fuels';

export interface Predicate {
  abi: JsonAbi;
  bin: BytesLike;
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
    predicate.bin,
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
    bytecode: arrayify(predicate.bin),
    abi: predicate.abi,
    provider,
    configurableConstants: {
      SIGNER: convertAddress(address),
    },
    inputData,
  });
