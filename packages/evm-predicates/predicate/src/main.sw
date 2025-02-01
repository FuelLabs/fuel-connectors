predicate;
use std::{
    b512::B512,
    bytes::Bytes,
    constants::ZERO_B256,
    tx::{
        tx_id,
        tx_witness_data,
    },
    vm::evm::{
        ecr::ec_recover_evm_address,
    },
};

/// Personal sign prefix for Ethereum inclusive of the 32 bytes for the length of the Tx ID.
///
/// # Additional Information
///
/// Take "\x19Ethereum Signed Message:\n32" and converted to hex.
/// The 00000000 at the end is the padding added by Sway to fill the word.
const ETHEREUM_PREFIX = 0x19457468657265756d205369676e6564204d6573736167653a0a363400000000;

struct SignedData {
    /// The id of the transaction to be signed.
    transaction_id: (b256, b256),
    /// EIP-191 personal sign prefix.
    ethereum_prefix: b256,
    /// Additional data used for reserving memory for hashing (hack).
    #[allow(dead_code)]
    empty: b256,
}

configurable {
    /// The Ethereum address that signed the transaction.
    SIGNER: b256 = ZERO_B256,
}

fn main(witness_index: u64) -> bool {
    // Retrieve the Ethereum signature from the witness data in the Tx at the specified index.
    let signature: B512 = tx_witness_data(witness_index).unwrap();

    // Hash the Fuel Tx (as the signed message) and attempt to recover the signer from the signature.
    let result = ec_recover_evm_address(signature, personal_sign_hash(tx_id()));

    // If the signers match then the predicate has validated the Tx.
    if result.is_ok() {
        if SIGNER == result.unwrap().into() {
            return true;
        }
    }

    // Otherwise, an invalid signature has been passed and we invalidate the Tx.
    false
}

const ASCII_MAP: [u8; 16] = [
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102
];

fn b256_to_ascii_bytes(val: b256) -> (b256, b256) {
    let bytes = Bytes::from(val);
    let mut ascii_bytes = Bytes::with_capacity(64);
    let mut idx = 0;

    while idx < 32 {
        let b = bytes.get(idx).unwrap();
        ascii_bytes.push(ASCII_MAP[(b >> 4).as_u64()]);
        ascii_bytes.push(ASCII_MAP[(b & 15).as_u64()]);
	    idx = idx + 1;
    }

    asm(ptr: ascii_bytes.ptr()) {
        ptr: (b256, b256)
    }
}

/// Return the Keccak-256 hash of the transaction ID in the format of EIP-191.
///
/// # Arguments
///
/// * `transaction_id`: [b256] - Fuel Tx ID.
fn personal_sign_hash(transaction_id: b256) -> b256 {
    // Hack, allocate memory to reduce manual `asm` code.
    let transaction_id_utf8 = b256_to_ascii_bytes(transaction_id);
    let data = SignedData {
        transaction_id: transaction_id_utf8,
        ethereum_prefix: ETHEREUM_PREFIX,
        empty: ZERO_B256,
    };

    // Pointer to the data we have signed external to Sway.
    let data_ptr = asm(ptr: data.transaction_id) {
        ptr
    };

    // The Ethereum prefix is 28 bytes (plus padding we exclude).
    // The Tx ID is 32 bytes at the end of the prefix.
    let len_to_hash = 28 + 64;

    // Create a buffer in memory to overwrite with the result being the hash.
    let mut buffer = b256::min();

    // Copy the Tx ID to the end of the prefix and hash the exact len of the prefix and id (without
    // the padding at the end because that would alter the hash).
    asm(
        hash: buffer,
        tx_id: data_ptr,
        end_of_prefix: data_ptr + len_to_hash,
        prefix: data.ethereum_prefix,
        id_len: 64,
        hash_len: len_to_hash,
    ) {
        mcp end_of_prefix tx_id id_len;
        k256 hash prefix hash_len;
    }

    // The buffer contains the hash.
    buffer
}
