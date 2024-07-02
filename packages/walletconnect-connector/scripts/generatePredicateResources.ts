import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const generatePredicateResources = (meta: string) => {
  const dirname = path.dirname(fileURLToPath(meta));
  let code = 'export const predicates = {\n';

  const outputDirectory = `${dirname}/../predicate/out/release`;
  const abiPath = `${outputDirectory}/verification-predicate-abi.json`;
  const bytecodePath = `${outputDirectory}/verification-predicate.bin`;

  const predicateAddress = fs
    .readFileSync(`${outputDirectory}/verification-predicate-bin-root`)
    .toString();

  const versionsPath = `${dirname}/../versions`;

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
  code += `    bytecode: base64ToUint8Array('${bytecode.toString(
    'base64',
  )}'),\n`;
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

  fs.writeFileSync(`${dirname}/../src/generated/predicate.ts`, code);
  versions(meta);
  console.log('Generated');
};

export const versions = (meta: string) => {
  const __dirname = path.resolve(
    `${path.dirname(fileURLToPath(meta))}/../versions`,
  );
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
