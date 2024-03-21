use fuels::{
    prelude::{abigen, launch_provider_and_get_wallet, TxPolicies},
    tx::Witness,
    types::{transaction::Transaction, Bits256, EvmAddress},
};

use ethers_core::{
    rand::thread_rng,
    types::{Signature, U256},
};
use ethers_signers::{LocalWallet, Signer as EthSigner};

const SCRIPT_BINARY_PATH: &str = "./out/release/verification-script.bin";

abigen!(Script(
    name = "MyScript",
    abi = "verification-script/out/release/verification-script-abi.json"
));

fn convert_eth_address(eth_wallet_address: &[u8]) -> [u8; 32] {
    let mut address: [u8; 32] = [0; 32];
    address[12..].copy_from_slice(eth_wallet_address);
    address
}

#[tokio::test]
async fn valid_signature_returns_true_for_validating() {
    // Create a Fuel wallet which will fund the predicate for test purposes
    let fuel_wallet = launch_provider_and_get_wallet().await.unwrap();

    // Create eth wallet and convert to EVMAddress
    let eth_wallet = LocalWallet::new(&mut thread_rng());
    let padded_eth_address = convert_eth_address(&eth_wallet.address().0);
    let evm_address = EvmAddress::from(Bits256(padded_eth_address));

    // Create the predicate by setting the signer and pass in the witness argument
    let witness_index = 1;
    let configurables = MyScriptConfigurables::new().with_SIGNER(evm_address);

    let script_call_handler = MyScript::new(fuel_wallet.clone(), SCRIPT_BINARY_PATH)
        .with_configurables(configurables)
        .main(witness_index)
        .with_tx_policies(
            TxPolicies::default()
                .with_witness_limit(144)
                .with_script_gas_limit(1_000_000),
        );

    let mut tx = script_call_handler.build_tx().await.unwrap();

    // Now that we have the Tx the ethereum wallet must sign the ID
    let consensus_parameters = fuel_wallet.provider().unwrap().consensus_parameters();
    let tx_id = tx.id(consensus_parameters.chain_id);

    let signature = eth_wallet.sign_message(*tx_id).await.unwrap();

    // Convert into compact format `[u8; 64]` for Sway
    let compact_signature = compact(&signature);

    // Add the signed data as a witness onto the Tx
    tx.append_witness(Witness::from(compact_signature.to_vec()))
        .unwrap();

    // Execute the Tx
    let tx_id = fuel_wallet
        .provider()
        .unwrap()
        .send_transaction(tx)
        .await
        .unwrap();

    let tx_status = fuel_wallet
        .provider()
        .unwrap()
        .tx_status(&tx_id)
        .await
        .unwrap();

    let response = script_call_handler.get_response_from(tx_status).unwrap();

    assert!(response.value);
}

#[tokio::test]
async fn invalid_signature_returns_false_for_failed_validation() {
    // Create a Fuel wallet which will fund the predicate for test purposes
    let fuel_wallet = launch_provider_and_get_wallet().await.unwrap();

    // Create eth wallet and convert to EVMAddress
    let eth_wallet = LocalWallet::new(&mut thread_rng());
    let padded_eth_address = convert_eth_address(&eth_wallet.address().0);
    let evm_address = EvmAddress::from(Bits256(padded_eth_address));

    // Create the predicate by setting the signer and pass in the witness argument
    let witness_index = 1;
    let configurables = MyScriptConfigurables::new().with_SIGNER(evm_address);

    let script_call_handler = MyScript::new(fuel_wallet.clone(), SCRIPT_BINARY_PATH)
        .with_configurables(configurables)
        .main(witness_index)
        .with_tx_policies(
            TxPolicies::default()
                .with_witness_limit(144)
                .with_script_gas_limit(1_000_000),
        );

    let mut tx = script_call_handler.build_tx().await.unwrap();

    // Now that we have the Tx the ethereum wallet must sign the ID
    let consensus_parameters = fuel_wallet.provider().unwrap().consensus_parameters();
    let tx_id = tx.id(consensus_parameters.chain_id);

    let signature = eth_wallet.sign_message(*tx_id).await.unwrap();

    // Convert into compact format `[u8; 64]` for Sway
    let mut compact_signature = compact(&signature);

    // Invalidate the signature to force a different address to be recovered
    // Flipping 1 byte is sufficient to fail recovery
    // Keep it within the bounds of a u8
    if compact_signature[0] < 255 {
        compact_signature[0] += 1;
    } else {
        compact_signature[0] -= 1;
    }

    // Add the signed data as a witness onto the Tx
    tx.append_witness(Witness::from(compact_signature.to_vec()))
        .unwrap();

    // Execute the Tx
    let tx_id = fuel_wallet
        .provider()
        .unwrap()
        .send_transaction(tx)
        .await
        .unwrap();

    let tx_status = fuel_wallet
        .provider()
        .unwrap()
        .tx_status(&tx_id)
        .await
        .unwrap();

    let response = script_call_handler.get_response_from(tx_status).unwrap();

    assert!(!response.value);
}

// This can probably be cleaned up
fn compact(signature: &Signature) -> [u8; 64] {
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
