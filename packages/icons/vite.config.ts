import {access, copyFile, mkdir, readdir} from 'node:fs/promises';
import {resolve} from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

import pkg from '../../package.json';

const externalPackages = [
  'react',
  'react-dom',
  ...Object.keys(pkg.dependencies),
];

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'some-vk-project',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: externalPackages,
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        preserveModules: true,
        format: 'esm',
      },
    },
    minify: false,
  },
  plugins: [
    dts({rollupTypes: true}),
    {
      name: 'log-on-build',
      async closeBundle() {
        const sourceResultDir = resolve(__dirname, 'tmp/result');
        const sourceIndexHtml = resolve(sourceResultDir, 'index.html');
        const sourceStyleCss = resolve(sourceResultDir, 'style.css');
        const distDir = resolve(__dirname, 'dist');
        const targetIndexHtml = resolve(distDir, 'index.html');
        const targetIndexCss = resolve(distDir, 'index.css');

        await mkdir(distDir, {recursive: true});

        try {
          await access(sourceIndexHtml);
          await copyFile(sourceIndexHtml, targetIndexHtml);

          // website.njk ожидает index.css, а svgtofont генерирует style.css
          await copyFile(sourceStyleCss, targetIndexCss);

          const resultFiles = await readdir(sourceResultDir);

          const fontFiles = resultFiles.filter((fileName) =>
            fileName.endsWith('.woff2'),
          );

          await Promise.all(
            fontFiles.map(async (fontFileName) => {
              await copyFile(
                resolve(sourceResultDir, fontFileName),
                resolve(distDir, fontFileName),
              );
            }),
          );
        } catch {
          console.error(
            `Не удалось скопировать артефакты из ${sourceResultDir} в ${distDir}.`,
          );
        }

        // eslint-disable-next-line no-console
        console.log(
          '🎉 Билд полностью завершен! Результат в папке «dist». Запустите «npm run start», чтобы посмотреть результат',
        );
      },
    },
  ],
});
