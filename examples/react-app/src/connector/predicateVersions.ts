import { arrayify } from '@ethersproject/bytes';
import { getAllPredicateVersions, versions } from 'bakosafe';
import type { PredicateVersion } from '.';

export const PREDICATE_VERSIONS = getAllPredicateVersions().reduce(
  (acc, version) => {
    acc[version] = {
      generatedAt: versions[version].time,
      predicate: {
        abi: versions[version].abi,
        bin: arrayify(versions[version].bytecode),
      },
    };
    return acc;
  },
  {} as Record<string, PredicateVersion>,
);
