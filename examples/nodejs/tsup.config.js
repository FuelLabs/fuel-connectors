import baseConfig from '@fuels/tsup-config';
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  ...baseConfig(options, { withReact: false }),
  entry: ['src/index.ts'],
  noExternal: ['@fuels/connectors'],
  minify: false,
  splitting: true,
  metafile: true,
}));
