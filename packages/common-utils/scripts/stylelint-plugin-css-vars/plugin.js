const stylelint = require('stylelint');
const {getAllowedCSSVarsSet, isIgnoredCSSVar, readIgnoredCSSVars} = require('./utils');

const ruleName = 'css-vars/valid-css-vars';
const messages = stylelint.utils.ruleMessages(ruleName, {
  invalid: (varName) => `CSS переменная "${varName}" не найдена в TWClassNames.js.
  Или ты опечатался, так как мы используем CSS vars из ui-kit или
  ее надо добавить в packages/common-utils/scripts/stylelint-plugin-css-vars/ignoredCSSVars.js, если все в порядке`,
  invalidSyntax: (varContent) => `Некорректный синтаксис CSS переменной: "var(${varContent})"`,
});

const ruleFunction = (primaryOption, secondaryOptionObject, context) => {
  return (root, result) => {
    const validOptions = stylelint.utils.validateOptions(
      result,
      ruleName,
      {
        actual: primaryOption,
        possible: [true, false],
      },
      {
        actual: secondaryOptionObject,
        possible: {
          ignorePattern: [String],
        },
        optional: true,
      }
    );

    if (!validOptions) {
      return;
    }

    const allowedVars = getAllowedCSSVarsSet();
    const ignoredVars = readIgnoredCSSVars();
    const varRegex = /var\(([^)]*)\)/g;
    const cssVarRegex = /^--[a-zA-Z0-9_-]+$/;

    root.walkDecls((decl) => {
      const value = decl.value;
      let match;

      while ((match = varRegex.exec(value)) !== null) {
        const varContent = match[1].trim();
        const firstArg = varContent.split(',')[0]?.trim() || '';

        if (!cssVarRegex.test(firstArg)) {
          stylelint.utils.report({
            message: messages.invalidSyntax(varContent),
            node: decl,
            word: varContent,
            result,
            ruleName,
          });
          continue;
        }

        if (isIgnoredCSSVar(firstArg, ignoredVars)) {
          continue;
        }

        if (!allowedVars.has(firstArg)) {
          stylelint.utils.report({
            message: messages.invalid(firstArg),
            node: decl,
            word: firstArg,
            result,
            ruleName,
          });
        }
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;

module.exports = stylelint.createPlugin(ruleName, ruleFunction);
