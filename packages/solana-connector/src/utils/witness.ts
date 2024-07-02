import type { BytesLike } from 'fuels';

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

  // if it is a placeholder witness, we can safely replace it, otherwise we will consider a new element.
  return hasPlaceholderWitness ? witnesses.length - 1 : witnesses.length;
};
