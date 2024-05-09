import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/examples/**', ...coverageConfigDefaults.exclude],
    },
  },
});
