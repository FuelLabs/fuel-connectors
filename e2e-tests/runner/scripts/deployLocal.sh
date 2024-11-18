#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Build contracts"
pnpm fuels build 

echo "Deploy contract"
pnpm fuels deploy

CONTRACT_IDS_PATH="$SCRIPT_DIR/../src/contracts/contract-ids.json"
OUTPUT_PATH_APP="$SCRIPT_DIR/../../../examples/react-app/src/types/contract-ids-local.json"

mkdir -p "$(dirname "$OUTPUT_PATH_APP")"

CONTRACT_ID=$(jq -r '.customAsset // empty' "$CONTRACT_IDS_PATH")

jq -n --arg counter "$CONTRACT_ID" '{ "counter": $counter }' > "$OUTPUT_PATH_APP"
echo "Saved contract ID as 'counter' in contract-ids-local.json"