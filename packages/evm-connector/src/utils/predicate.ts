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

/**
 * Since the predicate resources were fetched and added to the TransactionRequest before the predicate
 * was instantiated, it is very likely that they were fetched and added as normal account resources,
 * resulting in a witness placeholder being added to the witnesses of the TransactionRequest to
 * later be replaced with an actual signature. Since predicate resources do not require a signature,
 * this placeholder witness will be removed when calling `Predicate.populateTransactionPredicateData`.
 * However, we need to validate if this placeholder witness was added here in order to instantiate the
 * predicate with the correct witness index argument.
 */
export const getSignatureIndex = (witnesses: BytesLike[]) => {
  const hasPlaceholderWitness = witnesses.some(
    (item) =>
      item instanceof Uint8Array &&
      item.length === 64 &&
      item.every((value) => value === 0),
  );

  return hasPlaceholderWitness ? witnesses.length - 1 : witnesses.length;
};
