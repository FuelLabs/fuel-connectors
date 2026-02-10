import baseConfig from '@fuels/tsup-config';
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  ...baseConfig(options, { withReact: false }),
  format: ['cjs', 'esm'],
  external: ['fuels', '@privy-io/react-auth'],
  noExternal: ['@fuel-connectors/bako-predicate-connector'],
  dts: {
    resolve: ['@fuel-connectors/bako-predicate-connector'],
  },
  entry: ['src/index.ts'],
}));
