import { arrayify } from 'fuels';
import type { JsonAbi } from 'fuels';
import type { PredicateConfig } from '../types';
import { VerificationPredicateAbi__factory } from './predicates';

export const predicates: Record<string, PredicateConfig> = {
  'verification-predicate': {
    abi: VerificationPredicateAbi__factory.abi as JsonAbi,
    bytecode: arrayify(VerificationPredicateAbi__factory.bin),
  },
};
