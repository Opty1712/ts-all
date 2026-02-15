const path = require('path');

/**
 * Абсолютный путь до корня монорепозитория.
 */
const ROOT_DIR = path.resolve(__dirname, '../../../../');

/**
 * Путь до источника валидных ui-kit CSS tokens.
 */
const TW_CLASS_NAMES_PATH = path.join(ROOT_DIR, 'packages/ui-kit/src/styles/generated/TWClassNames.js');

/**
 * Кандидаты для чтения значений CSS-переменных.
 */
const TOKENS_CSS_CANDIDATES = [
  path.join(ROOT_DIR, 'packages/ui-kit/src/styles/generated/tailwindOutputFile.css'),
  path.join(ROOT_DIR, 'packages/ui-kit/lib/style.css'),
];

/**
 * Путь до snippets для VS Code.
 */
const VSCODE_SNIPPETS_PATH = path.join(ROOT_DIR, '.vscode/demo-css-vars.code-snippets');

/**
 * Путь до Live Templates для WebStorm.
 */
const WEBSTORM_TEMPLATES_PATH = path.join(ROOT_DIR, '.idea/liveTemplates/demo-css-vars.xml');

/**
 * Путь до постоянного allow-list CSS переменных.
 */
const IGNORED_VARS_PATH = path.join(__dirname, 'ignoredCSSVars.js');

/**
 * Путь до диагностического отчета с ошибочными CSS переменными.
 */
const CSS_VARS_ERRORS_PATH = path.join(__dirname, 'CSSVarsErrors.js');

/**
 * Список директорий, которые не нужно сканировать при обходе файлов.
 */
const SKIP_SCAN_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', 'build', '.next']);

module.exports = {
  ROOT_DIR,
  TW_CLASS_NAMES_PATH,
  TOKENS_CSS_CANDIDATES,
  VSCODE_SNIPPETS_PATH,
  WEBSTORM_TEMPLATES_PATH,
  IGNORED_VARS_PATH,
  CSS_VARS_ERRORS_PATH,
  SKIP_SCAN_DIRECTORIES,
};
