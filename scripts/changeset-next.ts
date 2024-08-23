import { writeFileSync } from 'node:fs';

const output = `---
"@fuels/connectors": patch
"@fuels/react": patch
---

incremental
`;
writeFileSync('.changeset/fuel-labs-ci.md', output);
