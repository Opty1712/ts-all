import type {StorybookConfig} from '@storybook/react-webpack5';
import path from 'path';
import TSConfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-designs',
    'storybook-tailwind-dark-mode',
    'storybook-css-modules-preset',
  ],
  framework: '@storybook/react-webpack5',
  docs: {autodocs: 'tag'},
  webpackFinal: async (config) => {
    const sbConfig = {
      ...config,
      resolve: {
        ...config.resolve,
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.mdx'],
        modules: [
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname, '../../node_modules'),
          'node_modules',
        ],
        plugins: [new TSConfigPathsPlugin()],
      },
    };

    sbConfig.module?.rules?.push({
      test: /\.(ts|js)x?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            babelrcRoots: ['.', './../../packages/*'],
            presets: [
              ['@babel/preset-env'],
              ['@babel/preset-react', {runtime: 'automatic'}],
              ['@babel/preset-typescript'],
            ],
          },
        },
      ],
    });

    return sbConfig;
  },
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: false,
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !prop.parent.fileName.includes('node_modules') : true),
    },
  },
};

export default config;
