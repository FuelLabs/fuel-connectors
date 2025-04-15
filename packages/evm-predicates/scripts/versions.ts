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
