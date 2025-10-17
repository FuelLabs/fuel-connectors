import { arrayify } from '@ethersproject/bytes';
import type { PredicateVersion } from '@fuel-connectors/bako-predicate-connector';
import { Wallet, getCompatiblePredicateVersions, versions } from 'bakosafe';

export function getPredicateVersions(wallet: Wallet = Wallet.EVM) {
  const compatibleVersions = getCompatiblePredicateVersions(wallet);

  return compatibleVersions.reduce(
    (acc, version) => {
      const v = versions[version];
      if (!v || !v.time || !v.abi || !v.bytecode) return acc;

      acc[version] = {
        generatedAt: v.time,
        predicate: {
          abi: v.abi,
          bin: arrayify(v.bytecode),
        },
      };

      return acc;
    },
    {} as Record<string, PredicateVersion>,
  );
}
