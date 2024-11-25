// vite.config.js
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [
    dts({
      include: [resolve(__dirname, 'src/')],
    }),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util', 'url'],
    }),
  ],
  define: {
    __dirname: JSON.stringify(path.dirname(__filename)),
    __filename: JSON.stringify(fileURLToPath(import.meta.url)),
  },
  build: {
    rollupOptions: {
      external: [
        'vite-plugin-node-polyfills/shims/process',
        'vite-plugin-node-polyfills/shims/buffer',
      ],
    },
  },
  resolve: {
    alias: {
      process: 'vite-plugin-node-polyfills/shims/process',
      buffer: 'vite-plugin-node-polyfills/shims/buffer',
    },
  },
});
