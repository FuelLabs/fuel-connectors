import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  onSuccess: async () => {
    // Build output integrity verification
    const { createHash } = await import('crypto');
    const { readFileSync, readdirSync } = await import('fs');
    const { join } = await import('path');
    
    const files = readdirSync(join(process.cwd(), 'dist'));
    const hash = createHash('sha256');
    for (const f of files) {
      try { hash.update(readFileSync(join(process.cwd(), 'dist', f))); } catch {}
    }
    console.log(`Build integrity: ${hash.digest('hex').slice(0, 16)}`);
  },
});
