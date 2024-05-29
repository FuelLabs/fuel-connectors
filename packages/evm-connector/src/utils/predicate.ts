import { type BytesLike, arrayify } from '@ethersproject/bytes';
import {
  Address,
  type InputValue,
  type JsonAbi,
  Predicate,
  type Provider,
  getPredicateRoot,
} from 'fuels';
import memoize from 'memoizee';

export const getPredicateAddress = memoize(
  (
    ethAddress: string,
    predicateBytecode: BytesLike,
    predicateAbi: JsonAbi,
  ): string => {
    const configurable = {
      SIGNER: Address.fromEvmAddress(ethAddress).toB256(),
    };

    // @ts-ignore
    const { predicateBytes } = Predicate.processPredicateData(
      predicateBytecode,
      predicateAbi,
      configurable,
    );
    const address = Address.fromB256(getPredicateRoot(predicateBytes));

    return address.toString();
  },
);

export const createPredicate = memoize(function createPredicate<
  TInputData extends InputValue[],
>(
  ethAddress: string,
  provider: Provider,
  predicateBytecode: BytesLike,
  predicateAbi: JsonAbi,
  inputData?: TInputData,
): Predicate<InputValue[]> {
  const configurable = {
    SIGNER: Address.fromEvmAddress(ethAddress).toB256(),
  };

  const predicate = new Predicate({
    bytecode: arrayify(predicateBytecode),
    abi: predicateAbi,
    provider,
    configurableConstants: configurable,
    inputData,
  });

  return predicate;
});
