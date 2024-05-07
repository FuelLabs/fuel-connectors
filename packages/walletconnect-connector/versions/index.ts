import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const versions = () => {
  const versionsFolders = fs
    .readdirSync(`${__dirname}`)
    .filter(
      (folder) => folder !== 'index.ts' && folder !== 'versions-dictionary.ts',
    );

  const versionsMap = versionsFolders.map((folder) => {
    const abi = fs.readFileSync(`${__dirname}/${folder}/abi.json`, 'utf8');
    const bytecode = fs.readFileSync(`${__dirname}/${folder}/bytecode.bin`);
    const generatedAt = fs.readFileSync(
      `${__dirname}/${folder}/generation-date.txt`,
    );

    const predicateCode = `
    export const predicate = {
      abi: ${abi},
      bytecode: base64ToUint8Array('${bytecode.toString('base64')}'),
    }

    function base64ToUint8Array(base64: string) {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }
    `;

    fs.writeFileSync(`${__dirname}/${folder}/predicate.ts`, predicateCode);

    return {
      version: folder,
      generatedAt: generatedAt.toString(),
    };
  });

  let dictionary = '';

  versionsMap.forEach((version) => {
    dictionary += `import { predicate as predicate${version.generatedAt} } from './${version.version}/predicate';\n`;
  });

  dictionary += '\nexport const VERSIONS = {\n';

  versionsMap.forEach((version) => {
    dictionary += `  '${version.version}': {\n`;
    dictionary += `    predicate: predicate${version.generatedAt},\n`;
    dictionary += `    generatedAt: ${Number(version.generatedAt)},\n`;
    dictionary += '  },\n';
  });

  dictionary += '};';

  fs.writeFileSync(`${__dirname}/versions-dictionary.ts`, dictionary);
};
