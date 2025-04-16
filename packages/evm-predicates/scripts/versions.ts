import { readFileSync, writeFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateVersions } from '@fuel-connectors/common/scripts';
import { txIdEncoders } from '../src';

const __filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(__filename);
const __dirname = path.normalize(`${currentDir}/../src/generated`);

/**
 * Generate the versions of the predicates.
 */
const versions = await generateVersions(__dirname, 'Evm');

/**
 * Sync the txIdEncoders.
 */
console.log('Syncing txIdEncoders...');

const encoderIds = Object.keys(txIdEncoders);
const predicateIds = versions.map((v) => v.version);
const missingIds = predicateIds.filter((id) => !encoderIds.includes(id));

const txIdEncodersPath = join(
  __dirname,
  '..',
  'src',
  'utils',
  'txIdEncoders.ts',
);

let newTxIdEncoders = '';

for (const id of missingIds) {
  const encoder = `\n  '${id}': {\n    encodeTxId: encodeTxIdUtf8,\n  },`;
  newTxIdEncoders += encoder;
}

const contents = readFileSync(txIdEncodersPath, 'utf8');

const updatedContents = contents.replace(
  /TxIdEncoder> = {/,
  `TxIdEncoder> = {${newTxIdEncoders}`,
);

writeFileSync(txIdEncodersPath, updatedContents);

console.log('TxIdEncoders synced.', txIdEncodersPath);
