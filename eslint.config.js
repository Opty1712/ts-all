/* eslint-disable @typescript-eslint/no-require-imports */
const pluginJs = require('@eslint/js');
const {uiKitRules} = require('@demo/ui-kit/eslint.config.ui-kit.vars');
const stylistic = require('@stylistic/eslint-plugin');
const parser = require('@typescript-eslint/parser');
const compat = require('eslint-plugin-compat');
const CSS = require('eslint-plugin-css');
const pluginReact = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const storybook = require('eslint-plugin-storybook');
const tailwindcss = require('eslint-plugin-tailwindcss');
const unusedImports = require('eslint-plugin-unused-imports');
const globalEnvs = require('globals');
const tsEslint = require('typescript-eslint');
const eslintPluginPrettier = require('eslint-plugin-prettier/recommended');
const eslintConfigPrettier = require('eslint-config-prettier');
const mobxPlugin = require('./packages/common-utils/scripts/eslint-plugin-mobx.js');

const globals = {
  ...globalEnvs.browser,
  ...globalEnvs.node,
  ...globalEnvs.es2022,
  jasmine: true,
};

module.exports = [
  pluginJs.configs.recommended,
  ...tsEslint.configs.recommendedTypeChecked,
  pluginReact.configs.flat?.recommended,
  eslintPluginPrettier,
  eslintConfigPrettier,
  {
    plugins: {
      'react-hooks': reactHooks,
      css: CSS,
      'unused-imports': unusedImports,
      '@stylistic': stylistic,
      tailwindcss,
      storybook,
      mobx: mobxPlugin,
    },
  },
  {
    languageOptions: {
      globals,
      parser,
      parserOptions: {
        globals,
        ecmaFeatures: {
          jsx: true,
        },
        project: ['./tsconfig.json', './tsconfig.eslint.json', './packages/*/tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ['**/*.mjs'],
    ...tsEslint.configs.disableTypeChecked,
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  {
    ignores: [
      '**/node_modules/**',
      'playwright.config.ts',
      '**/*.css.d.ts',
      '**/*.css.d.ts.map',
      '**/src/index.html',
      '**/reports/*',
      '**/dist/*',
      '**/lib/*',
      '**/build/*',
      '**/coverage/*',
      '**/storybook-static/*',
      'packages/icons/src/generatedTypes.ts',
      'packages/icons/src/generatedIcons.tsx',
      'packages/icons/src/system/templates/style.css',
      'packages/ui-kit/src/styles/generated/**/*',
      'packages/ui-kit/src/scripts/**/*',
      'packages/app/**/*.mock.schema.ts',
      '.eslintcache',
      '.idea/**',
      '.vscode/**',
      'stylelint.config.mjs',
      '.claude/**',
      'packages/common-utils/scripts/**/*',
      '.opencode/**',
    ],
  },

  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@demo/ui-kit/lib/*', '!@demo/ui-kit/lib/style.css'],
              message: 'Импорты из @demo/ui-kit/lib запрещены, кроме style.css',
            },
            {
              group: ['@demo/ui-kit/src'],
              message: 'Импорты из @demo/ui-kit/src запрещены',
            },
            {
              group: ['@demo/icons/dist/*', '!@demo/icons/dist/style.css'],
              message: 'Импорты из @demo/icons/dist запрещены, кроме style.css',
            },
            {
              group: ['@demo/common-utils/src'],
              message: 'Импорты из @demo/common-utils/src запрещены',
            },
            {
              group: ['@demo/common-utils/dist'],
              message: 'Импорты из @demo/common-utils/dist запрещены',
            },
            {
              group: ['@demo/icons/src'],
              message: 'Импорты из @demo/icons/src запрещены',
            },
          ],
        },
      ],
      'linebreak-style': ['error', 'unix'],
      'eol-last': ['error', 'always'],
      'max-len': [
        'error',
        {
          code: 120,
          tabWidth: 2,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreUrls: true,
          ignoreTemplateLiterals: true,
        },
      ],
      'no-trailing-spaces': ['error'],
      semi: 'off',
      'prefer-const': ['error'],
      'no-var': 'error',
      quotes: ['error', 'single'],
      'space-in-parens': ['error', 'never'],
      'arrow-parens': ['error', 'always'],
      eqeqeq: 'error',
      yoda: 'error',
      'brace-style': ['error', '1tbs'],
      'object-curly-spacing': ['error', 'never'],
      'array-bracket-spacing': ['error', 'never'],
      'comma-dangle': ['error', 'always-multiline'],
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/jsx-closing-bracket-location': 'error',
      'react/jsx-one-expression-per-line': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'semi-style': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
      ],
      '@typescript-eslint/array-type': ['error', {default: 'generic'}],
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'local',
          args: 'after-used',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: false,
          variables: false,
          enums: false,
          typedefs: false,
          ignoreTypeReferences: false,
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-inferrable-types': 'off',
      'no-unused-vars': [
        1,
        {
          vars: 'local',
          args: 'after-used',
          ignoreRestSiblings: true,
        },
      ],
      'no-mixed-spaces-and-tabs': 'error',
      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: [
            'multiline-expression',
            'return',
            'multiline-const',
            'multiline-block-like',
            'switch',
            'try',
            'while',
            'iife',
            'break',
            'case',
            'default',
            'block',
            'class',
            'for',
            'function',
            'if',
          ],
        },
        {
          blankLine: 'always',
          prev: [
            'multiline-expression',
            'return',
            'multiline-const',
            'multiline-block-like',
            'switch',
            'try',
            'while',
            'iife',
            'break',
            'case',
            'default',
            'block',
            'class',
            'for',
            'function',
            'if',
          ],
          next: '*',
        },
      ],
      'no-console': [
        'error',
        {
          allow: ['warn', 'error'],
        },
      ],
      'object-shorthand': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-eq-null': 'error',
      'unused-imports/no-unused-imports': 'error',
      'react/display-name': 'error',
      'react/jsx-key': 'error',
      '@typescript-eslint/require-await': 'off',
      'tailwindcss/no-custom-classname': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-children-prop': 'off',
      'no-prototype-builtins': 'off',
      'no-constant-binary-expression': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      'no-irregular-whitespace': 'off',
      '@stylistic/type-annotation-spacing': [
        'error',
        {
          before: true,
          after: true,
          overrides: {
            colon: {
              before: false,
              after: true,
            },
          },
        },
      ],
      '@stylistic/semi': ['error'],
      'no-useless-escape': 'off',
      'no-fallthrough': 'off',
      'no-case-declarations': 'off',
    },
  },
  {
    files: ['**/*.mjs'],
    rules: {
      '@typescript-eslint/prefer-includes': 'off',
      '@typescript-eslint/promise-function-async': 'off',
    },
  },

  {
    files: ['packages/ui-kit/**/*.{ts,tsx,js}', 'packages/ui-kit/.storybook/preview.tsx'],
    plugins: {compat},
    rules: uiKitRules,
  },

  {
    files: ['packages/app/**/*.{ts,tsx}'],
    rules: {
      'mobx/require-observer-with-usestores': 'error',
    },
  },
];
