/**
 * Находит CSS-переменные, которые используются в `.module.css/.module.scss`,
 * но отсутствуют в списке валидных токенов `TWClassNames.js` и не добавлены в `ignoredCSSVars.js`.
 *
 * Что делает:
 * - обходит модульные стили по монорепе;
 * - собирает `var(--token)` из файлов;
 * - исключает валидные токены и уже игнорируемые;
 * - записывает оставшиеся значения в `CSSVarsErrors.js`.
 *
 * Для чего нужен:
 * - как диагностический отчёт по новым/подозрительным CSS vars перед разбором и переносом в allow-list.
 */
const fs = require('fs');
const {CSS_VARS_ERRORS_PATH, ROOT_DIR} = require('./constants');
const {collectModuleStyleFiles, getAllowedCSSVarsSet, getUsedCSSVarsFromFile, readIgnoredCSSVars} = require('./utils');

/**
 * Формирует диагностический файл с CSS vars, которые не входят в ui-kit и allow-list.
 *
 * @returns {void}
 */
function generateIgnoredCSSVars() {
  const allowedVars = getAllowedCSSVarsSet();
  const existingIgnoredVars = new Set(readIgnoredCSSVars());
  const styleFiles = collectModuleStyleFiles(ROOT_DIR);
  const usedVars = new Set();

  for (const filePath of styleFiles) {
    const fileVars = getUsedCSSVarsFromFile(filePath);
    for (const varName of fileVars) {
      usedVars.add(varName);
    }
  }

  const ignoredVars = Array.from(usedVars)
    .filter((varName) => !allowedVars.has(varName) && !existingIgnoredVars.has(varName))
    .sort((a, b) => a.localeCompare(b));

  const escapedVars = ignoredVars.map((varName) => varName.replace(/\\/g, '\\\\').replace(/'/g, "\\'"));
  const formattedVars = escapedVars.length === 0 ? '' : `\n${escapedVars.map((varName) => `  '${varName}',`).join('\n')}\n`;
  const output = `module.exports = [${formattedVars}];\n`;

  fs.writeFileSync(CSS_VARS_ERRORS_PATH, output);

  console.log(`Scanned files: ${styleFiles.length}`);
  console.log(`Used vars found: ${usedVars.size}`);
  console.log(`Already ignored vars skipped: ${existingIgnoredVars.size}`);
  console.log(`Ignored vars written: ${ignoredVars.length}`);
  console.log(`Output: ${CSS_VARS_ERRORS_PATH}`);
}

generateIgnoredCSSVars();
