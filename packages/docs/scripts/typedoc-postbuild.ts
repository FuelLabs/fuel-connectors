import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import replace from 'replace';

type Link = {
  link: string;
  text: string;
  items: Link[];
  collapsed?: boolean;
};

type RegexReplacement = {
  regex: string;
  replacement: string;
};

/**
 * Post build script to trim off undesired leftovers from Typedoc, restructure directories and generate json for links.
 */
const filename = fileURLToPath(import.meta.url);
const docsDir = join(dirname(filename), '../src/');
const apiDocsDir = join(docsDir, '/api');
const classesDir = join(apiDocsDir, '/classes');
const modulesDir = join(apiDocsDir, '/modules');
const interfacesDir = join(apiDocsDir, '/interfaces_typedoc');
const enumsDir = join(apiDocsDir, '/enums');

const filesToRemove = [
  'api/modules.md',
  'api/classes',
  'api/modules',
  'api/interfaces_typedoc',
  'api/enums',
];

const secondaryEntryPoints = ['-index.md', '-test_utils.md', '-cli-utils.md'];
const secondaryModules: string[] = [];

const filePathReplacements: RegexReplacement[] = [];

const { log } = console;

/**
 * Removes unwanted files and dirs generated by typedoc.
 */
const removeUnwantedFiles = () =>
  filesToRemove.forEach((dirPath) => {
    const fullDirPath = join(docsDir, dirPath);
    rmSync(fullDirPath, { recursive: true, force: true });
  });

const renameInterfaces = () => {
  existsSync(join(apiDocsDir, 'interfaces')) &&
    renameSync(
      join(apiDocsDir, 'interfaces'),
      join(apiDocsDir, 'interfaces_typedoc'),
    );
};

/**
 * Generates a json file containing the links for the sidebar to be used by vitepress.
 */
const exportLinksJson = () => {
  const links: Link = {
    link: '/api/',
    text: 'API',
    collapsed: true,
    items: [],
  };
  const directories = readdirSync(apiDocsDir);
  directories
    .filter((directory) => !directory.endsWith('.md'))
    .forEach((directory) => {
      links.items.push({
        text: directory,
        link: `/api/${directory}/`,
        collapsed: true,
        items: [],
      });
      readdirSync(join(apiDocsDir, directory))
        .filter((file) => file !== 'index.md')
        .forEach((file) => {
          const index = links.items.findIndex(
            (item) => item.text === directory,
          );
          if (index !== -1) {
            const name = file.split('.')[0];
            links.items[index].items.push({
              text: name,
              link: `/api/${directory}/${name}`,
              items: [],
            });
          }
        });
    });

  writeFileSync('.typedoc/api-links.json', JSON.stringify(links));
};

/**
 * Flattens the module files generated by typedoc. Only necessary where a package
 * has multiple entry points.
 */
const flattenSecondaryModules = () => {
  const modulesFiles = existsSync(modulesDir) ? readdirSync(modulesDir) : [];
  const classesFiles = existsSync(classesDir) ? readdirSync(classesDir) : [];
  const interfacesFiles = existsSync(interfacesDir)
    ? readdirSync(interfacesDir)
    : [];
  const enumsFiles = existsSync(enumsDir) ? readdirSync(enumsDir) : [];

  const files = [
    ...classesFiles.map((c) => ({ name: c, path: classesDir })),
    ...interfacesFiles.map((i) => ({ name: i, path: interfacesDir })),
    ...enumsFiles.map((e) => ({ name: e, path: enumsDir })),
  ];

  // Extract secondary modules
  secondaryModules.push(
    ...modulesFiles
      .filter((file) =>
        secondaryEntryPoints.some((entryPoint) => file.includes(entryPoint)),
      )
      .map((file) => file.replace('fuel_connectors_', ''))
      .map((file) => file.split('.')[0]),
  );

  // Move files to the primary module
  secondaryModules.forEach((secondaryModule) => {
    const primaryModule = secondaryModule.split('-')[0];
    files.forEach(({ name, path }) => {
      if (name.includes(secondaryModule)) {
        const nameWithPrimaryModule = name.replace(
          secondaryModule,
          primaryModule,
        );
        renameSync(join(path, name), join(path, nameWithPrimaryModule));

        // Regenerate internal links for primary module
        filePathReplacements.push({
          regex: name.replace('.md', ''),
          replacement: nameWithPrimaryModule.replace('.md', ''),
        });
      }
    });
  });
};

/**
 * Alters the typedoc generated file structure to be more semantic.
 */
const alterFileStructure = () => {
  const modulesFiles = existsSync(modulesDir) ? readdirSync(modulesDir) : [];
  const classesFiles = existsSync(classesDir) ? readdirSync(classesDir) : [];
  const interfacesFiles = existsSync(interfacesDir)
    ? readdirSync(interfacesDir)
    : [];
  const enumsFiles = existsSync(enumsDir) ? readdirSync(enumsDir) : [];

  const files = [
    ...classesFiles.map((c) => ({ name: c, path: classesDir })),
    ...interfacesFiles.map((i) => ({ name: i, path: interfacesDir })),
    ...enumsFiles.map((e) => ({ name: e, path: enumsDir })),
  ];

  modulesFiles.forEach((modulesFile) => {
    console.log(modulesFile);
    // Create a new directory for each module
    const newDirName = modulesFile.split('.')[0];
    const newDirPath = join(apiDocsDir, newDirName);
    mkdirSync(newDirPath);

    // Prepare new module directory to remove 'fuel_connectors_' prefix
    let formattedDirName = newDirPath.split('fuel_connectors_')[1];
    if (!formattedDirName) formattedDirName = newDirPath.split('fuels_')[1];
    if (!formattedDirName) formattedDirName = newDirName;
    const capitalisedDirName =
      formattedDirName.charAt(0).toUpperCase() + formattedDirName.slice(1);

    files.forEach(({ name, path }) => {
      if (name.startsWith(newDirName)) {
        const newFilePath = join(newDirPath, name);
        copyFileSync(join(path, name), newFilePath);

        // Rename the file to remove module prefix
        const newName = name.split('-')[1];
        renameSync(newFilePath, join(newDirPath, newName));
        // Push a replacement for internal links cleanup
        filePathReplacements.push({
          regex: name,
          replacement: `/api/${capitalisedDirName}/${newName}`,
        });
      }
    });

    // Move module index file
    copyFileSync(join(modulesDir, modulesFile), join(newDirPath, 'index.md'));

    // Push a replacement for internal links cleanup
    filePathReplacements.push({
      regex: modulesFile,
      replacement: `/api/${capitalisedDirName}/index.md`,
    });

    // Rename module directory to capitalised name
    renameSync(newDirPath, join(apiDocsDir, capitalisedDirName));
  });
};

/**
 * Cleans up the secondary modules generated by typedoc.
 */
const cleanupSecondaryModules = () => {
  secondaryModules.forEach((secondaryModule) => {
    const primaryModule = secondaryModule.split('-')[0];
    const capitalisedSecondaryModuleName =
      secondaryModule.charAt(0).toUpperCase() + secondaryModule.slice(1);
    const capitalisedPrimaryModuleName =
      primaryModule.charAt(0).toUpperCase() + primaryModule.slice(1);

    const oldFilePath = join(
      apiDocsDir,
      capitalisedSecondaryModuleName,
      'index.md',
    );

    // Format the name so there isn't multiple index files for a single package
    let newFileName = secondaryModule.split('-')[1];
    newFileName =
      newFileName === 'index'
        ? 'src-index'
        : `${newFileName.replace('_', '-')}-index`;
    const newFilePath = join(
      apiDocsDir,
      capitalisedPrimaryModuleName,
      `${newFileName}.md`,
    );

    // Move the secondary module index file to the primary module
    renameSync(oldFilePath, newFilePath);

    // Regenerate links for the secondary module
    filePathReplacements.push({
      regex: `${capitalisedSecondaryModuleName}/index`,
      replacement: `${capitalisedPrimaryModuleName}/${newFileName}`,
    });

    // Remove the secondary module
    rmSync(join(apiDocsDir, capitalisedSecondaryModuleName), {
      recursive: true,
      force: true,
    });
  });
};

/**
 * Recreates the generated typedoc links
 */
const recreateInternalLinks = () => {
  const topLevelDirs = readdirSync(apiDocsDir);

  const prefixReplacements: RegexReplacement[] = [
    // Prefix/Typedoc cleanups
    { regex: '../modules/', replacement: '/api/' },
    { regex: '../classes/', replacement: '/api/' },
    { regex: '../interfaces/', replacement: '/api/' },
    { regex: '../enums/', replacement: '/api/' },
    { regex: 'fuel_connectors_', replacement: '' },
    { regex: 'fuels_', replacement: '' },
    { regex: '/api//api/', replacement: '/api/' },
  ];

  topLevelDirs
    .filter((directory) => !directory.endsWith('.md'))
    .forEach((dir) => {
      [...filePathReplacements, ...prefixReplacements].forEach(
        ({ regex, replacement }) => {
          replace({
            regex,
            replacement,
            paths: [join(apiDocsDir, dir)],
            recursive: true,
            silent: true,
          });
        },
      );
    });
};

const generateHooks = () => {
  const hooks = [] as { text: string; link: string; items: [] }[];
  const hooksDir = join(apiDocsDir, 'Hooks');
  const reactHooksDir = join(docsDir, 'guide', 'react-hooks');
  const writeLines: Record<string, Record<string, string[]>> = {};
  const sectionsToIgnore = ['Parameters', 'Type parameters'];

  const md = readFileSync(`${hooksDir}/index.md`, 'utf-8');
  const lines = md.split('\n');
  // Skip whole section
  let skipSection = true;
  let currentHook = '';
  let currentSection = 'index';

  for (let i = 0; i < lines.length; i++) {
    // If the line starts with '###', it's a hook
    if (lines[i].startsWith('### ')) {
      skipSection = false;

      // Add new hook to the list
      const name = lines[i].split('### ')[1].trim();
      currentHook = name;
      currentSection = 'index';
      writeLines[currentHook] = { index: [] };
      writeLines[currentHook][currentSection].push(`# ${name}`);
      writeLines[currentHook][currentSection].push('---');

      i += 3; // Skip the next 3 lines
    }
    if (lines[i].startsWith('#### Returns')) {
      skipSection = false;
      currentSection = 'Returns';
      writeLines[currentHook][currentSection] = [];
      writeLines[currentHook][currentSection].push(lines[i]);
      i += 3; // Skip the next 3 lines
    }
    for (const section of sectionsToIgnore) {
      if (lines[i].startsWith(`#### ${section}`)) {
        skipSection = true;
      }
    }
    if (lines[i].startsWith('**`')) {
      skipSection = false;
      const name = lines[i].split('**`')[1].split('`')[0];
      currentSection = `${name}`;
      writeLines[currentHook][currentSection] = [];
      writeLines[currentHook][currentSection].push(`#### ${name}`);
      i += 1; // Skip the next line
    }

    // If there's lines to write, we're in a hook scope
    if (!skipSection) writeLines[currentHook][currentSection].push(lines[i]);
  }
  for (const hook of Object.keys(writeLines)) {
    const hookLines = [] as string[];
    hookLines.push(...writeLines[hook].index);
    const validSections = ['Params', 'Returns', 'Examples', 'Deprecated'];
    for (const section of validSections) {
      if (
        writeLines[hook][section] &&
        writeLines[hook][section].filter(Boolean).length > 1
      )
        hookLines.push(...writeLines[hook][section]);
    }
    writeFileSync(join(reactHooksDir, `${hook}.md`), hookLines.join('\n'));
    hooks.push({
      text: hook,
      link: `/guide/react-hooks/${hook}`,
      items: [],
    });
  }

  writeFileSync('.typedoc/hooks-links.json', JSON.stringify(hooks));
};

const main = () => {
  log('Cleaning up API docs.');
  renameInterfaces();
  flattenSecondaryModules();
  alterFileStructure();
  cleanupSecondaryModules();
  removeUnwantedFiles();
  exportLinksJson();
  recreateInternalLinks();
  generateHooks();
};

main();
