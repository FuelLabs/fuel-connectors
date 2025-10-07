import { Address, Predicate, getPredicateRoot } from 'fuels';
import type { Hex } from 'viem';
import type { Maybe, PredicateConfig } from './types';

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
 * Checks if the code is running in a browser environment.
 * Used for conditional logic that depends on browser APIs.
 */
export const HAS_WINDOW = typeof window !== 'undefined' && window.localStorage;

/**
 * Global window object or empty object if not in browser.
 * Provides safe access to browser APIs.
 */
export const WINDOW = HAS_WINDOW ? window : null;

export const ORIGIN = WINDOW ? WINDOW.location.origin : 'testmode';

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
