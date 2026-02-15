/* eslint-disable @typescript-eslint/no-require-imports */

const customCSSPlugin = require('tailwindcss/plugin');
const customCSS = require('../src/styles/customCSS.json');

/**
 * Плагин для шеринга кастомных классов между CSS modules
 * tailwind запускается в параллели для каждого CSS module и пытается шерить знания о каждом процессе, но без гарантий,
 * из-за чего может оказаться что класс объявленный в tailwindBase.css в момент сборке может быть ещё не обработан
 * В таком случае билд упадёт в ошибку
 * {@link https://github.com/tailwindlabs/tailwindcss/issues/5989|issue}
 */
module.exports = customCSSPlugin(({addUtilities}) => {
  addUtilities(customCSS);
});
