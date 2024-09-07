import type { PREDICATE_VERSIONS } from './generated';

export type SolanaPredicateRoot = keyof typeof PREDICATE_VERSIONS;
type TxIdEncoder = {
  encodeTxId: (txId: string) => Uint8Array;
};

const encodeLegacyTxId = (txId: string) => {
  const txIdNo0x = txId.slice(2);
  const idBytes = `${txIdNo0x.slice(0, 16)}${txIdNo0x.slice(-16)}`;
  return new TextEncoder().encode(idBytes);
};

const encodeDefaultTxId = (txId: string) => {
  const txIdNo0x = txId.slice(2);
  return new TextEncoder().encode(txIdNo0x);
};

export const txIdEncoders: Record<SolanaPredicateRoot, TxIdEncoder> = {
  '0x15f8fd16e3281aa89e7567c5f8423f77b34983a8cd7d0a1714100c8bc3d4c8d0': {
    encodeTxId: encodeDefaultTxId,
  },
  '0x8f562b4f23ce90b0547d11e4e02462d3cd660f4f3fe5f719ae725eab4d7a5d42': {
    encodeTxId: encodeLegacyTxId,
  },
  '0xde460159d843b97ff69209d996687424b9b6ee95ef7a92a6950f4e99540f23f7': {
    encodeTxId: encodeLegacyTxId,
  },
};
