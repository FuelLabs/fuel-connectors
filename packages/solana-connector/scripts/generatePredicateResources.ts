import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let code = 'export const predicates = {\n';

const outputDirectory = `${__dirname}/../predicate/out/release`;
const abiPath = `${outputDirectory}/verification-predicate-abi.json`;
const bytecodePath = `${outputDirectory}/verification-predicate.bin`;

const abi = fs.readFileSync(abiPath, 'utf8');
const bytecode = fs.readFileSync(bytecodePath);

code += `  'verification-predicate': {\n`;
code += `    abi: ${abi},\n`;
code += `    bytecode: base64ToUint8Array('${bytecode.toString('base64')}'),\n`;
code += '  },\n';

code += `
};

function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
`;

fs.writeFileSync(`${__dirname}/../src/generated/predicate.ts`, code);
console.log('Generated');
