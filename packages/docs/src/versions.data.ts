import { readFileSync } from 'node:fs';

export default {
  load() {
    const appPackage = JSON.parse(
      readFileSync('../connectors/package.json', 'utf8'),
    );

    return {
      version: appPackage.version,
    };
  },
};
