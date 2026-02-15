import {resolve} from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'common-utils',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    outDir: 'dist',
    minify: false,
    target: 'es2015',
    rollupOptions: {
      output: {preserveModules: true, format: 'esm'},
    },
  },
  plugins: [dts()],
});
