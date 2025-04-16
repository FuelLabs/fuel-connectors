import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateVersions } from '@fuel-connectors/common/scripts';

const __filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(__filename);
const __dirname = path.normalize(`${currentDir}/../src/generated`);

/**
 * Generate the versions of the predicates.
 */
await generateVersions(__dirname, 'Sol');
