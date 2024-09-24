import baseConfig from '@fuels/tsup-config';
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  ...baseConfig(options),
  dts: true,
  minify: true,
  clean: true,
  entry: ['src/index.ts'],
  external: ['react', 'react-dom', '@tanstack/react-query', 'fuels'],
}));
