import { Address, Predicate, getPredicateRoot } from 'fuels';
import type { Hex } from 'viem';
import type { Maybe, PredicateConfig } from './types';

// ============================================================
// Utility functions
// ============================================================

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

// ============================================================
// Predicate utility functions
// ============================================================

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
  signerAddress,
  predicate: { abi, bin },
}: {
  signerAddress: string;
  predicate: PredicateConfig;
}): Hex => {
  // Process predicate data to generate predicate bytes
  // Note: processPredicateData is only available in the Predicate class
  // @ts-expect-error processPredicateData is only available in the Predicate class
  const { predicateBytes } = Predicate.processPredicateData(bin, abi, {
    SIGNER: signerAddress,
  });

  // Convert predicate bytes to Fuel address format
  const predicateRoot = getPredicateRoot(predicateBytes);
  return Address.fromB256(predicateRoot).toString() as Hex;
};
