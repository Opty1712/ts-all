const mobxPlugin = {
  rules: {
    'require-observer-with-usestores': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Требует оборачивать React компоненты в observer, если они используют useStores',
          category: 'Best Practices',
          recommended: true,
        },
        schema: [],
        messages: {
          missingObserver: 'Компонент использует useStores, но не обернут в observer. Добавьте observer() обертку.',
        },
      },
      create(context) {
        const componentsWithUseStores = new Set();

        return {
          // Отслеживаем вызов useStores внутри компонентов
          CallExpression(node) {
            if (node.callee.name === 'useStores') {
              // Находим родительский компонент
              let parent = node.parent;

              while (parent) {
                // Проверяем функциональные компоненты
                if (
                  (parent.type === 'FunctionDeclaration' && parent.id && /^[A-Z]/.test(parent.id.name)) ||
                  (parent.type === 'VariableDeclarator' &&
                    parent.id &&
                    parent.id.name &&
                    /^[A-Z]/.test(parent.id.name) &&
                    (parent.init?.type === 'ArrowFunctionExpression' || parent.init?.type === 'FunctionExpression'))
                ) {
                  let componentName;

                  if (parent.type === 'FunctionDeclaration') {
                    componentName = parent.id.name;
                  } else {
                    componentName = parent.id.name;
                  }

                  componentsWithUseStores.add(componentName);

                  break;
                }

                parent = parent.parent;
              }
            }
          },

          // Проверяем в конце файла
          'Program:exit'(programNode) {
            const sourceCode = context.getSourceCode();
            const program = sourceCode.ast;

            // Проверяем все компоненты, которые используют useStores
            componentsWithUseStores.forEach((componentName) => {
              let hasObserver = false;

              // Проверяем экспорт компонента
              program.body.forEach((node) => {
                // Проверяем экспорт по умолчанию с observer
                if (
                  node.type === 'ExportDefaultDeclaration' &&
                  node.declaration.type === 'CallExpression' &&
                  node.declaration.callee.name === 'observer'
                ) {
                  // Проверяем, что внутри observer именно наш компонент
                  if (
                    node.declaration.arguments[0] &&
                    ((node.declaration.arguments[0].type === 'Identifier' &&
                      node.declaration.arguments[0].name === componentName) ||
                      (node.declaration.arguments[0].type === 'FunctionDeclaration' &&
                        node.declaration.arguments[0].id?.name === componentName))
                  ) {
                    hasObserver = true;
                  }
                }

                // Проверяем именованный экспорт с observer
                if (
                  node.type === 'ExportNamedDeclaration' &&
                  node.declaration &&
                  node.declaration.type === 'VariableDeclaration'
                ) {
                  node.declaration.declarations.forEach((decl) => {
                    if (
                      decl.id.name === componentName &&
                      decl.init &&
                      decl.init.type === 'CallExpression' &&
                      decl.init.callee.name === 'observer'
                    ) {
                      hasObserver = true;
                    }
                  });
                }

                // Проверяем объявление компонента с observer
                if (node.type === 'VariableDeclaration' && !node.parent.type.includes('Export')) {
                  node.declarations.forEach((decl) => {
                    if (
                      decl.id.name === componentName &&
                      decl.init &&
                      decl.init.type === 'CallExpression' &&
                      decl.init.callee.name === 'observer'
                    ) {
                      hasObserver = true;
                    }
                  });
                }
              });

              if (!hasObserver) {
                context.report({
                  node: programNode,
                  messageId: 'missingObserver',
                });
              }
            });
          },
        };
      },
    },
  },
};

module.exports = mobxPlugin;
