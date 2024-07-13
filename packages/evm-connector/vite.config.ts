// vite.config.js
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [
    dts({
      include: [resolve(__dirname, 'src/')],
    }),
  ],
  define: {
    __dirname: JSON.stringify(path.dirname(__filename)),
    __filename: JSON.stringify(fileURLToPath(import.meta.url)),
  },
  test: {
    environment: 'jsdom',
    deps: {
      moduleDirectories: ['node_modules', path.resolve('../../packages')],
    },
  },
});
