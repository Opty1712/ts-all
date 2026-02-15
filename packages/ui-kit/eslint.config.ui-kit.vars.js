/* eslint-disable @typescript-eslint/no-require-imports */
const figmaVariablesParsingFolder = __dirname + '/src/styles/generated/';
const {width, height, ...theme} = require(`${figmaVariablesParsingFolder}tailwindTheme.json`);

/** Экспортируем правила eslint для ui-kit, чтобы их забрать как FlatConfig в корневом `eslint.config.ts` */
const uiKitRules = {
  'tailwindcss/no-custom-classname': [
    'error',
    {
      cssFiles: [
        '**/*.css',
        '!**/node_modules',
        '!**/.*',
        '!**/dist',
        '!**/build',
        /** переписываем правило из-за вот этого невалидного файла шаблона */
        '!packages/icons/src/system/templates/style.css',
      ],
      config: {
        theme: {
          /** Включаем правило, даем ему только наши «разрешенные» ключи */
          colors: require(`${figmaVariablesParsingFolder}tailwindLightColors.json`),
          ...theme,
          extend: {width, height},
        },
      },
    },
  ],
  'tailwindcss/classnames-order': 'off',
  '@typescript-eslint/naming-convention': 'off',
};

module.exports = {uiKitRules};
