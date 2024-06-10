import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { versions } from '../versions';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let code = 'export const predicates = {\n';

const outputDirectory = `${__dirname}/../predicate/out/release`;
const abiPath = `${outputDirectory}/verification-predicate-abi.json`;
const bytecodePath = `${outputDirectory}/verification-predicate.bin`;

const predicateAddress = fs
  .readFileSync(`${outputDirectory}/verification-predicate-bin-root`)
  .toString();

const versionsPath = `${__dirname}/../versions`;

const isNewPredicate =
  fs
    .readdirSync(versionsPath)
    .find((version) => version === predicateAddress) === undefined;

if (isNewPredicate) {
  fs.mkdirSync(`${versionsPath}/${predicateAddress}`);

  fs.copyFileSync(abiPath, `${versionsPath}/${predicateAddress}/abi.json`);
  fs.copyFileSync(
    bytecodePath,
    `${versionsPath}/${predicateAddress}/bytecode.bin`,
  );

  const date = new Date();
  fs.writeFileSync(
    path.join(versionsPath, predicateAddress, 'generation-date.txt'),
    date.getTime().toString(),
  );
}

const abi = fs.readFileSync(abiPath, 'utf8');
const bytecode = fs.readFileSync(bytecodePath);

code += `  'verification-predicate': {\n`;
code += `    abi: ${abi},\n`;
code += `    bytecode: base64ToUint8Array('${bytecode.toString('base64')}'),\n`;
code += '  },\n';

code += `
};

function base64ToUint8Array(base64: string) {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
`;

fs.writeFileSync(`${__dirname}/../src/generated/predicate.ts`, code);
versions();
console.log('Generated');
