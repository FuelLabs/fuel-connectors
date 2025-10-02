import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  build: {
    sourcemap: false,
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      external: [
        'crypto',
        'stream',
        'util',
        'url',
        'http',
        'https',
        'zlib',
        'events',
      ],
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@fuels/connectors', '@fuels/react'],
  },
});
