predicate;

use std::{
    b512::B512,
    constants::ZERO_B256,
    ecr::{
        EcRecoverError,
        ed_verify,
    },
    tx::{
        tx_id,
        tx_witness_data,
    },
};

configurable {
    /// The Ethereum address that signed the transaction.
    SIGNER: b256 = ZERO_B256,
}

fn main() -> bool {
    // Retrieve the Solana signature from the witness data in the Tx at the specified index.
    let signature: B512 = tx_witness_data(0);

    // Attempt to recover the signer from the signature.
    let result = ed_verify(SIGNER, signature, tx_id());

    return result.is_ok();
}
