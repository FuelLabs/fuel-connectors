import baseConfig from '@fuels/tsup-config';
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  ...baseConfig(options, { withReact: false }),
  entry: [
    'src/index.ts',
    'src/walletconnect-connector/index.ts',
    'src/evm-connector/index.ts',
  ],
  external: ['fuels'],
  noExternal: [
    '@fuel-connectors/fuel-development-wallet',
    '@fuel-connectors/fuel-wallet',
    '@fuel-connectors/fuelet-wallet',
    '@fuel-connectors/burner-wallet-connector',
    '@fuel-connectors/evm-connector',
    '@fuel-connectors/walletconnect-connector',
    '@fuel-connectors/bakosafe-connector',
  ],
  minify: 'terser',
  dts: {
    resolve: [
      '@fuel-connectors/fuel-development-wallet',
      '@fuel-connectors/fuel-wallet',
      '@fuel-connectors/fuelet-wallet',
      '@fuel-connectors/burner-wallet-connector',
      '@fuel-connectors/evm-connector',
      '@fuel-connectors/walletconnect-connector',
      '@fuel-connectors/bakosafe-connector',
    ],
  },
  splitting: true,
  metafile: true,
}));
