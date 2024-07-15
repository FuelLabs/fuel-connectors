import { arrayify } from 'fuels';
import type { JsonAbi } from 'fuels';
import { VerificationPredicateAbi__factory } from './predicates';

export const predicates = {
  'verification-predicate': {
    abi: VerificationPredicateAbi__factory.abi as JsonAbi,
    bytecode: arrayify(VerificationPredicateAbi__factory.bin),
  },
};
