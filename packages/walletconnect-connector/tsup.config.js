import baseConfig from '@fuels/tsup-config';
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  ...baseConfig(options, { withReact: false }),
  format: ['cjs'],
  external: ['fuels'],
  noExternal: ['@fuel-connectors/bako-predicate-connector'],
  dts: {
    resolve: ['@fuel-connectors/bako-predicate-connector'],
  },
  entry: ['src/index.ts'],
}));
