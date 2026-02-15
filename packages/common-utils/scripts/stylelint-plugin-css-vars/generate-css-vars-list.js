/**
 * Генерирует файлы автокомплита CSS-переменных для VS Code и WebStorm.
 *
 * Что делает:
 * - читает список валидных CSS vars из `packages/ui-kit/src/styles/generated/TWClassNames.js`;
 * - пытается подтянуть значения токенов из сгенерированного CSS (`tailwindOutputFile.css`, fallback `lib/style.css`);
 * - формирует:
 *   - `.vscode/demo-css-vars.code-snippets` для VS Code;
 *   - `.idea/liveTemplates/demo-css-vars.xml` для WebStorm.
 *
 * Для чего нужен:
 * - чтобы после билда `ui-kit` разработчик сразу получал подсказки по дизайн-токенам в CSS/SCSS.
 */
const fs = require('fs');
const path = require('path');
const {TOKENS_CSS_CANDIDATES, VSCODE_SNIPPETS_PATH, WEBSTORM_TEMPLATES_PATH} = require('./constants');
const {escapeXml, getAllowedCSSVars, getCSSVarValuesMap} = require('./utils');

/**
 * Генерирует XML c Live Templates для WebStorm.
 *
 * @param {string[]} cssVars Список CSS-переменных.
 * @param {Map<string, string>} cssVarValues Карта значений CSS-переменных.
 * @returns {void}
 */
function generateWebStormLiveTemplates(cssVars, cssVarValues) {
  const templatesXml = cssVars
    .map((varName) => {
      const value = cssVarValues.get(varName);
      const description = value ? `${value} ${varName}` : `Design token ${varName}`;
      const templateName = varName.replace(/^--/, '');

      return [
        `  <template name="${escapeXml(templateName)}" value="${escapeXml(varName)}" description="${escapeXml(description)}" toReformat="false" toShortenFQNames="true" shortcut="TAB">`,
        '    <context>',
        '      <option name="CSS_PROPERTY_VALUE" value="true" />',
        '      <option name="CSS_DECLARATION_BLOCK" value="true" />',
        '      <option name="CSS_RULESET_LIST" value="true" />',
        '      <option name="CSS" value="true" />',
        '    </context>',
        '  </template>',
      ].join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<templateSet group="Demo CSS Vars">',
    templatesXml,
    '</templateSet>',
    '',
  ].join('\n');

  fs.mkdirSync(path.dirname(WEBSTORM_TEMPLATES_PATH), {recursive: true});
  fs.writeFileSync(WEBSTORM_TEMPLATES_PATH, xml);
}

/**
 * Генерирует файлы автокомплита CSS vars для VS Code и WebStorm.
 *
 * @returns {void}
 */
function generateAutocompleteFiles() {
  const cssVars = getAllowedCSSVars();
  const cssVarValues = getCSSVarValuesMap();
  const getVarDescription = (varName) => {
    const value = cssVarValues.get(varName);
    return value ? `${varName}: ${value}` : `Design token ${varName}`;
  };

  const snippets = cssVars.reduce((accumulator, varName) => {
    const value = cssVarValues.get(varName);
    const snippetKey = value ? `${value} ${varName}` : `CSS var ${varName}`;

    accumulator[snippetKey] = {
      scope: 'css,scss',
      prefix: [varName, varName.replace('--', '')],
      body: [varName],
      description: getVarDescription(varName),
    };

    return accumulator;
  }, {});

  fs.mkdirSync(path.dirname(VSCODE_SNIPPETS_PATH), {recursive: true});
  fs.writeFileSync(VSCODE_SNIPPETS_PATH, JSON.stringify(snippets, null, 2));
  generateWebStormLiveTemplates(cssVars, cssVarValues);

  console.log(`Generated snippets with ${cssVars.length} CSS variables`);
  console.log('.vscode/demo-css-vars.code-snippets - VS Code snippets');
  console.log('.idea/liveTemplates/demo-css-vars.xml - WebStorm Live Templates');
}

generateAutocompleteFiles();
