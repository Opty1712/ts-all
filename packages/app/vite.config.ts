import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react({
        babel: {
          plugins: [
            [
              '@babel/plugin-proposal-decorators',
              {
                version: '2023-05',
              },
            ],
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    root: path.resolve(__dirname, 'src'),
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      sourcemap: true,
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'src/index.html'),
        },
        output: {
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            const extType = name.split('.').pop() ?? '';

            if (/woff2?$/.test(extType)) {
              return 'fonts/[name]-[hash][extname]';
            }

            if (/css$/.test(extType)) {
              return 'styles/[name]-[hash][extname]';
            }

            return 'assets/[name]-[hash][extname]';
          },
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
        },
      },
    },
    define: {
      'process.env.API_URL': JSON.stringify(env.API_URL ?? ''),
      'process.env.IS_PROD': JSON.stringify(mode === 'production'),
    },
    css: {
      modules: {
        scopeBehaviour: 'local' as const,
        localsConvention: 'camelCase',
        generateScopedName: '[name]__[local]___[hash:base64:5]',
      },
      devSourcemap: true,
    },
    base: '/',
    appType: 'spa',
    server: {
      port: 443,
      open: 'http://localhost:443/',
      https: undefined,
      host: true,
    },
  };
});
