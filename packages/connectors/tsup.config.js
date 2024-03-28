import baseConfig from '@fuels/tsup-config';
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  ...baseConfig(options, { withReact: false }),
  platform: 'browser',
  entry: ['src/index.ts'],
  external: ['fuels'],
  noExternal: [
    '@fuel-connectors/fuel-development-wallet',
    '@fuel-connectors/fuel-wallet',
    '@fuel-connectors/fuelet-wallet',
    '@fuel-connectors/bako-safe',
  ],
  minify: 'terser',
  dts: {
    resolve: [
      '@fuel-connectors/fuel-development-wallet',
      '@fuel-connectors/fuel-wallet',
      '@fuel-connectors/fuelet-wallet',
      '@fuel-connectors/bako-safe',
    ],
  },
  splitting: true,
  metafile: true,
}));
