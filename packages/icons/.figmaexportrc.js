/* eslint-disable @typescript-eslint/no-require-imports */

const outputComponentsAsSvgModule = require('@figma-export/output-components-as-svg');
const outputComponentsAsSvg = outputComponentsAsSvgModule.default ?? outputComponentsAsSvgModule;

/** @type {import('@figma-export/types').FigmaExportRC} */
module.exports = {
  commands: [
    [
      'components',
      {
        /**
         * Например, ваш фигма файл выглядит так
         * https://www.figma.com/design/aSLjeN0RVh6BGKjvlsX53M/Icons-example-for-iconFont-generator-for?node-id=0-1&t=JWqPmdrrPJslVRKV-1
         * Значит fileId → aSLjeN0RVh6BGKjvlsX53M, остальные параметры не важны
         * */
        fileId: 'aSLjeN0RVh6BGKjvlsX53M',

        /** Указать страницы, только с которых нужно брать иконки */
        onlyFromPages: ['Page with icons'],
        outputters: [
          outputComponentsAsSvg({
            /**
             * В какую кнопку складываем импортированные SVG
             * Должно биться с `importedSVGFolder` в `src/system/generate.mts`
             * */
            output: './tmp/svgImported',
            getDirname: (options) => `${options.dirname}`,
          }),
        ],
      },
    ],
  ],
};
