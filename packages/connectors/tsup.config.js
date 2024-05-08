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
    // '@fuel-connectors/burner-wallet-connector',
    // '@fuel-connectors/evm-connector',
    // '@fuel-connectors/walletconnect-connector',
  ],
  // minify: 'terser',
  dts: {
    resolve: [
      '@fuel-connectors/fuel-development-wallet',
      '@fuel-connectors/fuel-wallet',
      '@fuel-connectors/fuelet-wallet',
      // '@fuel-connectors/burner-wallet-connector',
      // '@fuel-connectors/evm-connector',
      // '@fuel-connectors/walletconnect-connector',
    ],
  },
  splitting: true,
  metafile: true,
}));
