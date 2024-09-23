import tsconfig from './tsconfig.json';

const defConfig = {
  outDir: 'dist',
  splitting: true,
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return {
      js: `.${format}.js`,
    };
  },
  sourcemap: true,
  clean: false,
  target: tsconfig.compilerOptions.target,
  esbuildOptions(options) {
    options.banner = {
      js: "'use client'",
    };

    /* This is needed to not get any errors from dynamic requiring */
    options.external = ['react', 'react-dom', 'tailwindcss'];
  },
};

export default [
  {
    ...defConfig,
    entry: {
      index: 'src/index.ts',
    },
    publicDir: 'public',
  },
  {
    entry: {
      styles: 'src/global.css',
    },
    loader: {
      '.css': 'css',
    },
  },
];
