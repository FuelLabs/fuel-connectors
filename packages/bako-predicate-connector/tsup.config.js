import baseConfig from '@fuels/tsup-config';
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  ...baseConfig(options, { withReact: false }),
  external: ['fuels', 'socket.io-client'],
  entry: ['src/index.ts'],
}));
