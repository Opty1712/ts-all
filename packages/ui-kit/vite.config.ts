import browserslist from 'browserslist';
import {resolve} from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

import pkg from '../../package.json';

const target = convertTargetsForEsbuild();

const externalPackages = ['react', 'react-dom', ...Object.keys(pkg.dependencies || {}), '@demo/icons'];

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ui-kit',
      fileName: 'index',
      ...(isProd && {formats: ['es']}),
    },
    outDir: 'dist',
    minify: false,
    target,
    rollupOptions: {
      external: externalPackages,
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        ...(isProd && {preserveModules: true, format: 'esm'}),
      },
    },
  },
  css: {
    modules: {
      generateScopedName: '[hash:base64]',
    },
  },
  plugins: [
    dts({
      root: __dirname,
      entryRoot: 'src',
      outDir: 'dist',
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }),
  ],
});

/** esbuild принимает свой массив версий, который не бьется со стандартным browserlist */
function convertTargetsForEsbuild() {
  const targets = browserslist();

  return targets
    .filter((t) => !t.startsWith('and_chr'))
    .map((t) => {
      const [name, version] = t.split(' ');

      if (name === 'ios_saf') return `ios${version.split('-')[0]}`;

      return `${name}${version.split('-')[0]}`;
    });
}
