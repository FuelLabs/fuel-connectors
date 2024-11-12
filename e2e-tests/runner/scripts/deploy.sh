#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Build contracts"
pnpm fuels build > /dev/null 2>&1

echo "Deploy contract"
export CONTRACT_NAME="LocalIncrement"
pnpm fuels deploy

# Define paths for the input and both output files
CONTRACT_IDS_PATH="$SCRIPT_DIR/../src/contract-ids.json"
OUTPUT_PATH_APP="$SCRIPT_DIR/../../../examples/react-app/src/types/contract-ids-local.json"
# Ensure the output directory exists
mkdir -p "$(dirname "$OUTPUT_PATH_APP")"

# Extract the LocalIncrement contract ID from contract-ids.json
CONTRACT_ID=$(jq -r '.LocalIncrement' "$CONTRACT_IDS_PATH")

echo "SCRIPT_DIR is: $SCRIPT_DIR"
echo "CONTRACT_IDS_PATH is: $CONTRACT_IDS_PATH"
echo "OUTPUT_PATH_APP is: $OUTPUT_PATH_APP"
ls -la "$CONTRACT_IDS_PATH"

jq -n --arg counter "$CONTRACT_ID" '{ "counter": $counter }' > "$OUTPUT_PATH_APP"

echo "Saved contract ID as 'counter' in  contract-ids-local.json"
