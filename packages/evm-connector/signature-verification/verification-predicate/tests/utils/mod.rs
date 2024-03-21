use fuels::{
    accounts::{predicate::Predicate, Account},
    prelude::{abigen, AssetId, Bech32Address, Provider, ScriptTransaction, TxPolicies},
    types::{
        transaction_builders::{BuildableTransaction, ScriptTransactionBuilder},
        Bits256, EvmAddress,
    },
};

use ethers_core::types::{Signature, U256};

const PREDICATE_BINARY_PATH: &str = "./out/release/verification-predicate.bin";

abigen!(Predicate(
    name = "MyPredicate",
    abi = "verification-predicate/out/release/verification-predicate-abi.json"
));

fn pad_ethereum_address(eth_wallet_address: &[u8]) -> [u8; 32] {
    let mut address: [u8; 32] = [0; 32];
    address[12..].copy_from_slice(eth_wallet_address);
    address
}

pub(crate) async fn create_predicate(
    ethereum_address: [u8; 20],
    fuel_provider: &Provider,
) -> Predicate {
    let padded_ethereum_address = pad_ethereum_address(&ethereum_address);
    let evm_address = EvmAddress::from(Bits256(padded_ethereum_address));

    // Create the predicate by setting the signer and pass in the witness argument
    let witness_index = 0;
    let configurables = MyPredicateConfigurables::new().with_SIGNER(evm_address);
    let predicate_data = MyPredicateEncoder::encode_data(witness_index);

    Predicate::load_from(PREDICATE_BINARY_PATH)
        .unwrap()
        .with_provider(fuel_provider.clone())
        .with_data(predicate_data)
        .with_configurables(configurables)
}

pub(crate) async fn create_transaction(
    predicate: &Predicate,
    asset_id: AssetId,
    starting_balance: u64,
    transfer_amount: u64,
    recipient: &Bech32Address,
    provider: &Provider,
) -> ScriptTransaction {
    // Fetch predicate input in order to have a UTXO with funds for transfer
    let inputs = predicate
        .get_asset_inputs_for_amount(asset_id, starting_balance)
        .await
        .unwrap();

    // Specify amount to transfer to recipient, send the rest back to the predicate
    let outputs = predicate.get_asset_outputs_for_amount(recipient, asset_id, transfer_amount);

    // Create the Tx
    let transaction_builder = ScriptTransactionBuilder::prepare_transfer(
        inputs,
        outputs,
        TxPolicies::default().with_witness_limit(72),
    );

    transaction_builder.build(provider).await.unwrap()
}

// This can probably be cleaned up
pub(crate) fn compact(signature: &Signature) -> [u8; 64] {
    let shifted_parity = U256::from(signature.v - 27) << 255;

    let r = signature.r;
    let y_parity_and_s = shifted_parity | signature.s;

    let mut sig = [0u8; 64];
    let mut r_bytes = [0u8; 32];
    let mut s_bytes = [0u8; 32];
    r.to_big_endian(&mut r_bytes);
    y_parity_and_s.to_big_endian(&mut s_bytes);
    sig[..32].copy_from_slice(&r_bytes);
    sig[32..64].copy_from_slice(&s_bytes);

    sig
}
