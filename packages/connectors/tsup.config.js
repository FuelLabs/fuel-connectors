import baseConfig from '@fuels/tsup-config';
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  ...baseConfig(options, { withReact: false }),
  entry: ['src/index.ts'],
  external: ['fuels'],
  noExternal: [
    '@fuel-connectors/fuel-development-wallet',
    '@fuel-connectors/fuel-wallet',
    '@fuel-connectors/fuelet-wallet',
  ],
  // minify: 'terser',
  minify: false,
  dts: {
    resolve: [
      '@fuel-connectors/fuel-development-wallet',
      '@fuel-connectors/fuel-wallet',
      '@fuel-connectors/fuelet-wallet',
    ],
  },
  splitting: true,
  metafile: true,
}));
