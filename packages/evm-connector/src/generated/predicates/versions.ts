import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateVersions } from '@fuel-connectors/common/scripts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
await generateVersions(__dirname);
