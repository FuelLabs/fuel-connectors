#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/scripts"

echo "Build contracts"
pnpm fuels build 

echo "Deploy contract"
pnpm fuels deploy

# Define paths for the input and output files
CONTRACT_IDS_PATH="$SCRIPT_DIR/../src/contracts/contract-ids.json"
OUTPUT_PATH_APP="$SCRIPT_DIR/../../../examples/react-app/src/types/contract-ids-local.json"

# Ensure the output directory exists
mkdir -p "$(dirname "$OUTPUT_PATH_APP")"

# Debug: Show paths and check if CONTRACT_IDS_PATH exists
echo "SCRIPT_DIR is: $SCRIPT_DIR"
echo "CONTRACT_IDS_PATH is: $CONTRACT_IDS_PATH"
echo "OUTPUT_PATH_APP is: $OUTPUT_PATH_APP"

# Check if the contract-ids.json file exists and display its contents
if [ -f "$CONTRACT_IDS_PATH" ]; then
    echo "Found contract-ids.json at $CONTRACT_IDS_PATH"
    cat "$CONTRACT_IDS_PATH"
else
    echo "Error: $CONTRACT_IDS_PATH not found."
    exit 1
fi

# Extract the customAsset contract ID from contract-ids.json
CONTRACT_ID=$(jq -r '.customAsset // empty' "$CONTRACT_IDS_PATH")

# Check if CONTRACT_ID was successfully extracted
if [ -z "$CONTRACT_ID" ]; then
    echo "Error: Contract ID for 'customAsset' not found in $CONTRACT_IDS_PATH"
    exit 1
fi

# Save the contract ID to contract-ids-local.json
jq -n --arg counter "$CONTRACT_ID" '{ "counter": $counter }' > "$OUTPUT_PATH_APP"
echo "Saved contract ID as 'counter' in contract-ids-local.json"
