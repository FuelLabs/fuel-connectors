import { writeFileSync } from 'node:fs';

const output = `---
"@fuels/connectors": patch
---

incremental
`;
writeFileSync('.changeset/fuel-labs-ci.md', output);
