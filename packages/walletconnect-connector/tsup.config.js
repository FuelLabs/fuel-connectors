import baseConfig from '@fuels/tsup-config';
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  ...baseConfig(options, { withReact: false }),
  format: ['cjs'],
  external: ['fuels'],
  entry: ['src/index.ts'],
}));
