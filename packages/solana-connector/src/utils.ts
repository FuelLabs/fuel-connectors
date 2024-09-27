import type { PREDICATE_VERSIONS } from './generated';

export type SolanaPredicateRoot = keyof typeof PREDICATE_VERSIONS;
type TxIdEncoder = {
  encodeTxId: (txId: string) => Uint8Array;
};

const encodeDefaultTxId = (txId: string) => {
  const txIdNo0x = txId.slice(2);
  return new TextEncoder().encode(txIdNo0x);
};

export const txIdEncoders: Record<SolanaPredicateRoot, TxIdEncoder> = {
  '0x15f8fd16e3281aa89e7567c5f8423f77b34983a8cd7d0a1714100c8bc3d4c8d0': {
    encodeTxId: encodeDefaultTxId,
  },
};
