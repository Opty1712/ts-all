const fs = require('fs');
const path = require('path');
const {IGNORED_VARS_PATH, SKIP_SCAN_DIRECTORIES, TOKENS_CSS_CANDIDATES, TW_CLASS_NAMES_PATH} = require('./constants');

/**
 * Извлекает CSS-переменные из содержимого TWClassNames.js.
 *
 * @param {string} content Содержимое файла TWClassNames.js.
 * @returns {string[]} Массив CSS-переменных в формате `--token`.
 */
function parseCSSVarsFromTWClassNames(content) {
  const cssVarsMatch = content.match(/export const cssVars = \[([\s\S]*?)\]/);
  if (!cssVarsMatch) {
    return [];
  }

  const varsContent = cssVarsMatch[1];
  const vars = varsContent.match(/['"]--[^'"]+['"]/g) || [];
  return vars.map((entry) => entry.replace(/['"]/g, ''));
}

/**
 * Читает валидные CSS-переменные из TWClassNames.js.
 *
 * @returns {string[]} Массив валидных CSS-переменных.
 */
function getAllowedCSSVars() {
  try {
    const content = fs.readFileSync(TW_CLASS_NAMES_PATH, 'utf8');
    return parseCSSVarsFromTWClassNames(content);
  } catch (error) {
    console.error('Failed to read TWClassNames.js:', error);
    return [];
  }
}

/**
 * Читает валидные CSS-переменные из TWClassNames.js как Set.
 *
 * @returns {Set<string>} Set валидных CSS-переменных.
 */
function getAllowedCSSVarsSet() {
  return new Set(getAllowedCSSVars());
}

/**
 * Читает allow-list CSS-переменных из файла ignoredCSSVars.js.
 *
 * @returns {string[]} Массив игнорируемых CSS-переменных.
 */
function readIgnoredCSSVars() {
  try {
    delete require.cache[require.resolve(IGNORED_VARS_PATH)];
    const ignoredVars = require(IGNORED_VARS_PATH);
    return Array.isArray(ignoredVars) ? ignoredVars : [];
  } catch (error) {
    console.error('Failed to read ignoredCSSVars.js:', error);
    return [];
  }
}

/**
 * Проверяет, должна ли CSS-переменная быть проигнорирована.
 *
 * @param {string} varName Проверяемая CSS-переменная.
 * @param {string[]} ignoredVars Список игнорируемых переменных.
 * @returns {boolean} `true`, если переменную нужно игнорировать.
 */
function isIgnoredCSSVar(varName, ignoredVars) {
  return ignoredVars.some((ignoredVar) => {
    if (ignoredVar.endsWith('-')) {
      return varName.startsWith(ignoredVar);
    }

    return ignoredVar === varName;
  });
}

/**
 * Читает карту значений CSS-переменных из первого доступного CSS файла.
 *
 * @param {string[]} [cssFilePaths] Список кандидатов с CSS-переменными.
 * @returns {Map<string, string>} Карта `--token -> value`.
 */
function getCSSVarValuesMap(cssFilePaths = TOKENS_CSS_CANDIDATES) {
  const valuesMap = new Map();
  const varDeclarationRegex = /^\s*(--[A-Za-z0-9-_]+)\s*:\s*([^;]+);/gm;

  for (const cssFilePath of cssFilePaths) {
    if (!fs.existsSync(cssFilePath)) {
      continue;
    }

    const content = fs.readFileSync(cssFilePath, 'utf8');
    let match;

    while ((match = varDeclarationRegex.exec(content)) !== null) {
      const varName = match[1];
      const value = match[2].trim();

      if (!valuesMap.has(varName)) {
        valuesMap.set(varName, value);
      }
    }

    if (valuesMap.size > 0) {
      break;
    }
  }

  return valuesMap;
}

/**
 * Экранирует спецсимволы для XML-атрибутов.
 *
 * @param {string} value Исходная строка.
 * @returns {string} Безопасная строка для XML.
 */
function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Собирает все `.module.css` и `.module.scss` файлы рекурсивно.
 *
 * @param {string} rootDir Корневая директория сканирования.
 * @returns {string[]} Список путей до модульных CSS/SCSS файлов.
 */
function collectModuleStyleFiles(rootDir) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, {withFileTypes: true});

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (SKIP_SCAN_DIRECTORIES.has(entry.name)) {
          continue;
        }

        walk(fullPath);
        continue;
      }

      if (entry.isFile() && (fullPath.endsWith('.module.css') || fullPath.endsWith('.module.scss'))) {
        files.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return files;
}

/**
 * Извлекает CSS-переменные, использованные в `var(...)` внутри файла.
 *
 * @param {string} filePath Путь к CSS/SCSS файлу.
 * @returns {Set<string>} Set использованных CSS-переменных.
 */
function getUsedCSSVarsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const varRegex = /var\(\s*(--[A-Za-z0-9-_]+)/g;
  const vars = new Set();
  let match;

  while ((match = varRegex.exec(content)) !== null) {
    vars.add(match[1]);
  }

  return vars;
}

module.exports = {
  parseCSSVarsFromTWClassNames,
  getAllowedCSSVars,
  getAllowedCSSVarsSet,
  readIgnoredCSSVars,
  isIgnoredCSSVar,
  getCSSVarValuesMap,
  escapeXml,
  collectModuleStyleFiles,
  getUsedCSSVarsFromFile,
};
