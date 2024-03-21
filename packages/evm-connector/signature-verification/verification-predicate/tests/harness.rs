mod utils;

use utils::{compact, create_predicate, create_transaction};

use fuels::{
    accounts::{Account, ViewOnlyAccount},
    prelude::{launch_provider_and_get_wallet, AssetId, TxPolicies},
    tx::Witness,
    types::transaction::Transaction,
};

use ethers_core::rand::thread_rng;
use ethers_signers::{LocalWallet, Signer as EthSigner};

#[tokio::test]
async fn valid_signature_transfers_funds() {
    // Create a Fuel wallet which will fund the predicate for test purposes
    let fuel_wallet = launch_provider_and_get_wallet().await.unwrap();

    // Network related
    let fuel_provider = fuel_wallet.provider().unwrap();

    // Create an Ethereum wallet used to sign the Fuel Transaction ID
    let ethereum_wallet = LocalWallet::new(&mut thread_rng());

    // Create the predicate for signature verification
    let predicate = create_predicate(ethereum_wallet.address().0, fuel_provider).await;

    // Define the quantity and asset that the predicate account will contain
    let starting_balance = 100;
    let asset_id = AssetId::default();

    // Define the amount that will be transferred from the predicate to the recipient for a test
    let transfer_amount = 10;

    // Fund the predicate to check the change of balance upon signature recovery
    fuel_wallet
        .transfer(
            &predicate.address().clone(),
            starting_balance,
            asset_id,
            TxPolicies::default(),
        )
        .await
        .unwrap();

    // Create a transaction to send to the Fuel network
    let mut script_transaction = create_transaction(
        &predicate,
        asset_id,
        starting_balance,
        transfer_amount,
        fuel_wallet.address(),
        fuel_provider,
    )
    .await;

    // Now that we have the Tx the Ethereum wallet must sign the ID of the Fuel Tx
    let tx_id = script_transaction.id(fuel_provider.chain_id());

    // Original signature `{ r, s, v }` which is equivalent to [u8; 65]
    let signature = ethereum_wallet.sign_message(*tx_id).await.unwrap();

    // Convert into compact format `[u8; 64]` for Sway
    let compact_signature = compact(&signature);

    // Add the signed data as a witness onto the Tx
    script_transaction
        .append_witness(Witness::from(compact_signature.to_vec()))
        .unwrap();

    // Check predicate balance before sending the Tx
    let balance_before = predicate.get_asset_balance(&asset_id).await.unwrap();

    // Execute the Tx
    let _tx_id = fuel_provider
        .send_transaction(script_transaction)
        .await
        .unwrap();

    // Check predicate balance after sending the Tx
    let balance_after = predicate.get_asset_balance(&asset_id).await.unwrap();

    assert_eq!(balance_before, starting_balance);
    assert_eq!(balance_after, starting_balance - transfer_amount);
}

#[tokio::test]
async fn invalid_signature_reverts_predicate() {
    // Create a Fuel wallet which will fund the predicate for test purposes
    let fuel_wallet = launch_provider_and_get_wallet().await.unwrap();

    // Network related
    let fuel_provider = fuel_wallet.provider().unwrap();

    // Create an Ethereum wallet used to sign the Fuel Transaction ID
    let ethereum_wallet = LocalWallet::new(&mut thread_rng());

    // Create the predicate for signature verification
    let predicate = create_predicate(ethereum_wallet.address().0, fuel_provider).await;

    // Define the quantity and asset that the predicate account will contain
    let starting_balance = 100;
    let asset_id = AssetId::default();

    // Define the amount that will be transferred from the predicate to the recipient for a test
    let transfer_amount = 10;

    // Fund the predicate to check the change of balance upon signature recovery
    fuel_wallet
        .transfer(
            &predicate.address().clone(),
            starting_balance,
            asset_id,
            TxPolicies::default(),
        )
        .await
        .unwrap();

    // Create a transaction to send to the Fuel network
    let mut script_transaction = create_transaction(
        &predicate,
        asset_id,
        starting_balance,
        transfer_amount,
        fuel_wallet.address(),
        fuel_provider,
    )
    .await;

    // Now that we have the Tx the Ethereum wallet must sign the ID of the Fuel Tx
    let tx_id = script_transaction.id(fuel_provider.chain_id());

    // Original signature `{ r, s, v }` which is equivalent to [u8; 65]
    let signature = ethereum_wallet.sign_message(*tx_id).await.unwrap();

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
    script_transaction
        .append_witness(Witness::from(compact_signature.to_vec()))
        .unwrap();

    // Execute the Tx, causing a revert because the predicate fails to recovery correct address
    let tx_result = fuel_provider.send_transaction(script_transaction).await;

    assert!(tx_result.is_err());
}
