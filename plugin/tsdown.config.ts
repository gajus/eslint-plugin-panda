import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts', 'src/utils/worker.ts'],
  format: ['esm', 'cjs'],
  minify: false,
  report: true,
  shims: true,
  sourcemap: true,
});
