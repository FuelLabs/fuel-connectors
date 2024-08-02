import fs from 'node:fs';
import { getPredicateRoot } from 'fuels';

// When running pnpm fuels:build, the build script creates files
// differently than when running pnpm fuels:typegen
export const checkForcBuild = async (__dirname: string) => {
  const predicatePath = `${__dirname}/factories`;
  if (!fs.existsSync(predicatePath)) {
    console.info('No new predicate found. Ignoring...');
    return;
  }

  console.info('New predicate found. Moving to new folder...');
  const rightPath = `${__dirname}/new`;
  if (fs.existsSync(rightPath)) await addPredicate(__dirname);

  fs.mkdirSync(rightPath);
  fs.renameSync(predicatePath, `${rightPath}/factories`);
  fs.writeFileSync(
    `${rightPath}/index.ts`,
    `export { VerificationPredicateAbi__factory } from './factories/VerificationPredicateAbi__factory';`,
  );
  console.info('Predicate moved to new folder.');
};

export const addPredicate = async (__dirname: string) => {
  const predicatePath = `${__dirname}/new`;
  if (!fs.existsSync(predicatePath)) {
    console.info('No new predicate found. Ignoring...');
    return;
  }

  const { VerificationPredicateAbi__factory: predicate } = await import(
    predicatePath
  );
  const version = getPredicateRoot(predicate.bin);
  const newPath = `${__dirname}/${version}`;
  if (fs.existsSync(newPath)) {
    console.warn(`Predicate already exists: ${version}`);
    console.warn('Overwriting...');
    fs.rmSync(newPath, { recursive: true, force: true });
  }

  fs.mkdirSync(newPath);
  fs.copyFileSync(
    `${predicatePath}/factories/VerificationPredicateAbi__factory.ts`,
    `${newPath}/predicate.ts`,
  );

  const date = new Date();
  const code = `/* Autogenerated file. Do not edit manually. */\n\nexport const generationDate = ${date
    .getTime()
    .toString()};\nexport { VerificationPredicateAbi__factory as Predicate } from './predicate';\n`;
  fs.appendFileSync(`${newPath}/index.ts`, code);

  fs.rmSync(predicatePath, { recursive: true, force: true });
  console.info(`Predicate added: ${version}`);
};

export const syncPredicate = async (__dirname: string) => {
  const dictPath = `${__dirname}/index.ts`;
  const header = '/* Autogenerated file. Do not edit manually. */\n\n';
  fs.writeFileSync(dictPath, header);

  const versions = await Promise.all(
    fs
      .readdirSync(__dirname)
      .filter((f) => !f.includes('.ts'))
      .map(async (f) => {
        const { generationDate } = await import(`${__dirname}/${f}/index.ts`);
        return { version: f, date: generationDate };
      }),
  );
  if (versions.length === 0) {
    console.warn('No predicates found.');
    return;
  }

  const headers = versions.map(
    (v) => `import { Predicate as Predicate${v.date}} from './${v.version}';`,
  );

  const code = `\n\nexport default {\n${versions
    .map(
      (v) =>
        `\t'${v.version}': { predicate: Predicate${v.date}, generatedAt: ${v.date} }`,
    )
    .join(',\n')}
};\n`;
  fs.appendFileSync(dictPath, `${headers.join('\n')}${code}`);
  console.info('Dictionary updated.');
};

export const generateVersions = async (__dirname: string) => {
  await checkForcBuild(__dirname);
  await addPredicate(__dirname);
  await syncPredicate(__dirname);
  console.info('Done.');
};
