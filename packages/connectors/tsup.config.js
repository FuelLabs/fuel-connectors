import baseConfig from '@fuels/tsup-config';
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  ...baseConfig(options, { withReact: false }),
  entry: ['src/index.ts'],
  minify: 'terser',
  treeshake: true,
  splitting: true,
  metafile: true,
}));
