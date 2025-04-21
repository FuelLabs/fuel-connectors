#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Build contracts"
pnpm fuels build 

echo "Deploy contract"
pnpm fuels deploy

# Define paths for the input and output files
CONTRACT_IDS_PATH="$SCRIPT_DIR/../src/contracts/contract-ids.json"
OUTPUT_PATH_APP="$SCRIPT_DIR/../../../examples/react-app/src/types/contract-ids-local.json"

# Ensure the output directory exists
mkdir -p "$(dirname "$OUTPUT_PATH_APP")"

# Extract the customAsset contract ID from contract-ids.json
CONTRACT_ID=$(jq -r '.customAsset // empty' "$CONTRACT_IDS_PATH")

# Save the contract ID to contract-ids-local.json
jq -n --arg counter "$CONTRACT_ID" '{ "counter": $counter }' > "$OUTPUT_PATH_APP"
echo "Saved contract ID as 'counter' in contract-ids-local.json"