import { writeFileSync } from 'node:fs';

const output = `---
"@fuels/connectors": patch
"@fuels/react": patch
"@fuels/docs": patch
---

incremental
`;
writeFileSync('.changeset/fuel-labs-ci.md', output);
