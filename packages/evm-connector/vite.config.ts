import path from 'node:path';
// vite.config.js
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

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
  // test: {
  //   environment: 'jsdom',
  // },
});
