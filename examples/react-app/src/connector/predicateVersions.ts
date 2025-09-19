import { arrayify } from '@ethersproject/bytes';
import { Wallet, getCompatiblePredicateVersions, versions } from 'bakosafe';
import type { PredicateVersion } from '.';

const compatibleVersions = getCompatiblePredicateVersions(Wallet.EVM);

export const PREDICATE_VERSIONS = compatibleVersions.reduce(
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
