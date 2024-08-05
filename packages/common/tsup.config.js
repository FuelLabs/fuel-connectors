import baseConfig from '@fuels/tsup-config';
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  ...baseConfig(options, { withReact: false }),
  external: ['fuels'],
  entry: {
    index: 'src/index.ts',
    'scripts/index': 'scripts/index.ts',
  },
}));
