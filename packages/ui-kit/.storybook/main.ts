import {StorybookConfig} from '@storybook/react-webpack5';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/preset-typescript',
    '@storybook/addon-a11y',
    'storybook-tailwind-dark-mode',
    '@storybook/addon-designs',
  ],

  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },

  webpackFinal: async (config) => {
    config.module?.rules?.push({
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: {tailwindcss: {}, autoprefixer: {}},
            },
          },
        },
      ],
      include: path.resolve(__dirname, '../'),
    });

    const svgRule = config.module?.rules?.find(
      (rule) =>
        rule &&
        typeof rule === 'object' &&
        'test' in rule &&
        typeof rule.test === 'object' &&
        'test' in rule.test &&
        rule.test?.test('.svg'),
    );

    if (svgRule && typeof svgRule === 'object') {
      svgRule.exclude = /\.svg$/;
    }

    const mdxRule = config.module?.rules?.find(
      (rule) =>
        rule &&
        typeof rule === 'object' &&
        'test' in rule &&
        typeof rule.test === 'object' &&
        'test' in rule.test &&
        rule.test?.test('.mdx'),
    );

    if (mdxRule && typeof mdxRule === 'object') {
      mdxRule.exclude = /\.mdx$/;
    }

    config.module?.rules?.push({
      test: /\.mdx?$/,
      use: [
        {
          loader: '@mdx-js/loader',
        },
      ],
    });

    return config;
  },

  docs: {
    autodocs: true,
    defaultName: 'AutoDocs',
  },
};

export default config;
