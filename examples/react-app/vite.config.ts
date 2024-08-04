import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      exclude: ['fs', 'stream'],
      globals: {
        process: true,
      },
      protocolImports: false,
    }),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  // define: {
  //   'process.env': {},
  // },
});
