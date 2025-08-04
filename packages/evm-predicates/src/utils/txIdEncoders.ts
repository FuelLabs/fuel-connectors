import { stringToHex } from 'viem';
import type { PREDICATE_VERSIONS } from '../generated';

type TxIdEncoder = {
  encodeTxId: (txId: string) => string;
};

// Remove the '0x' prefix and convert the transaction ID to a UTF-8 hex string.
// For historical reasons, you must submit the message to sign in hex-encoded UTF-8.
// Some wallets (e.g., Ledger) require this format for proper signing.
const encodeTxIdUtf8 = (txId: string): string => {
  const txIdNo0x = txId.slice(2);
  return stringToHex(txIdNo0x);
};

// Previously, we signed the raw tx id (with the 0x prefix).
// However, some wallets (e.g., Ledger) failed to sign it correctly.
// To fix this, we now sign its UTF-8 representation instead.
const encodeTxIdLegacy = (txId: string): string => {
  return txId;
};

export const txIdEncoders: Record<string, TxIdEncoder> = {
  '0x3499b76bcb35d8bc68fb2fa74fbe1760461f64f0ac19890c0bacb69377ac19d2': {
    encodeTxId: encodeTxIdUtf8,
  },
  '0xbbae06500cd11e6c1d024ac587198cb30c504bf14ba16548f19e21fa9e8f5f95': {
    encodeTxId: encodeTxIdLegacy,
  },
  '0xfdac03fc617c264fa6f325fd6f4d2a5470bf44cfbd33bc11efb3bf8b7ee2e938': {
    encodeTxId: encodeTxIdLegacy,
  },
};
