import { arrayify } from '@ethersproject/bytes';
import { Wallet, getCompatiblePredicateVersions, versions } from 'bakosafe';
import { Address, Predicate, getPredicateRoot } from 'fuels';
import type { Hex } from 'viem';
import type { Maybe, PredicateConfig, PredicateVersion } from './types';

export { Wallet } from 'bakosafe';

/**
 * Throws an error if the value is null or undefined.
 * Useful for runtime type checking and error handling.
 *
 * @param value - The value to check
 * @param message - Error message to throw if value is falsy
 * @returns The value if it exists
 * @throws Error if value is null or undefined
 *
 * @example
 * ```typescript
 * const provider = getOrThrow(await getProvider(), 'Provider not available');
 * ```
 */
export const getOrThrow = <T>(value: Maybe<T>, message: string): T => {
  if (!value) throw new Error(message);
  return value;
};

/**
 * Generates Fuel predicate addresses based on signer address and predicate configuration.
 * This function processes predicate data and generates the corresponding Fuel address.
 *
 * @param params - Object containing signer address and predicate configuration
 * @param params.signerAddress - The signer's address
 * @param params.predicate - Predicate configuration with ABI and binary
 * @returns Hex string representing the Fuel predicate address
 *
 * @example
 * ```typescript
 * const predicateAddress = getFuelPredicateAddresses({
 *   signerAddress: '0x1234...',
 *   predicate: { abi: predicateAbi, bin: predicateBinary }
 * });
 * ```
 */
export const getFuelPredicateAddresses = ({
  predicate: { abi, bin },
}: {
  predicate: PredicateConfig;
}): Hex => {
  // @ts-expect-error processPredicateData is only available in the Predicate class
  const { predicateBytes } = Predicate.processPredicateData(bin, abi);
  const predicateRoot = getPredicateRoot(predicateBytes);
  return Address.fromB256(predicateRoot).toString() as Hex;
};

/**
 * Gets predicate versions compatible with a specific wallet type.
 * Returns a record of version identifiers mapped to their predicate configuration.
 *
 * @param wallet - The wallet type to get compatible versions for (defaults to EVM)
 * @returns Record of version identifiers to PredicateVersion objects
 *
 * @example
 * ```typescript
 * const versions = getPredicateVersions(Wallet.EVM);
 * ```
 */
export function getPredicateVersions(
  wallet: Wallet = Wallet.EVM,
): Record<string, PredicateVersion> {
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
