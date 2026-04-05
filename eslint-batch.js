/** Чтобы не крашить ESLint проходимся пачками по 1000 файлов */

/* eslint-disable */
const {ESLint} = require('eslint');
const {fork} = require('child_process');

if (process.env.IS_WORKER) {
  // ========== ВОРКЕР ==========
  (async () => {
    const files = JSON.parse(process.env.FILES);
    const eslint = new ESLint({fix: true});

    const results = await eslint.lintFiles(files);
    await ESLint.outputFixes(results);

    const errors = results.flatMap((result) =>
      result.messages
        .filter((msg) => msg.severity === 2)
        .map((msg) => ({
          filePath: result.filePath,
          line: msg.line,
          column: msg.column,
          message: msg.message,
          ruleId: msg.ruleId,
        })),
    );

    if (process.send) {
      process.send({errors});
    }

    process.exit(0);
  })();
} else {
  // ========== МАСТЕР ==========
  const allErrors = [];

  async function run() {
    const files = await getAllFiles('**/*.{ts,tsx,js,jsx,mjs,cjs}');
    const batchSize = 1000;

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      console.log(
        `Обработка батча ${i / batchSize + 1} (${batch.length} файлов)`,
      );

      await new Promise((resolve, reject) => {
        const child = fork(__filename, [], {
          env: {
            ...process.env,
            IS_WORKER: 'true',
            FILES: JSON.stringify(batch),
          },
        });

        child.on('message', (msg) => {
          if (msg.errors?.length) {
            allErrors.push(...msg.errors);
          }
        });

        child.on('exit', (code) => {
          if (global.gc) global.gc();

          if (code === 0) resolve();
          else reject(new Error(`Процесс батча завершился с кодом ${code}`));
        });
      });
    }

    // Вывод сводки
    if (allErrors.length > 0) {
      console.log('\n==== Сводка ошибок ESLint ====\n');

      allErrors.forEach((err) => {
        console.log(
          `${err.filePath}:${err.line}:${err.column} - ${err.message} (${err.ruleId})`,
        );
      });

      console.log(`\nВсего ошибок: ${allErrors.length}`);
    } else {
      console.log('\n🎉 Ошибок не найдено!');
    }
  }

  async function getAllFiles(pattern) {
    const {globby} = await import('globby');

    return globby(pattern, {
      absolute: true,
      ignore: [
        'node_modules/**/*',
        'playwright.config.ts',
        '**/*.css.d.ts',
        '**/src/index.html',
        '**/reports/*',
        '**/dist/*',
        '**/lib/*',
        '**/build/*',
        '**/coverage/*',
        '**/storybook-static/*',
        'packages/icons/src/generatedTypes.ts',
        'packages/icons/src/generatedIcons.tsx',
        'packages/ui-kit/src/styles/generated/**/*',
      ],
    });
  }

  run().catch((err) => {
    console.error('Ошибка:', err);
    process.exit(1);
  });
}
