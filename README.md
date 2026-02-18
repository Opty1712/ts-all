# Demo Web

Демо-монорепа к докладу «Как я начал типизировать всё. Даже то, что не принято».

Проект показывает типизацию и контрактный подход на разных слоях frontend, конкретная реализация каждого слоя описана внутри конкретных проектов монорепы.

## Ссылки из презентации

- [Слайды к презентации с Дизайн-выходных про то как токены из фигмы попадают в код](https://www.figma.com/proto/Wbt78lbe5Gix5nkUPd8Zou/RuStore-%E2%86%92-%D0%94%D0%92?page-id=111%3A13813&node-id=158-14546&starting-point-node-id=158%3A14546&t=KKyyCSG98j3DZLeg-1)
- [10 минутное видео, где я показываю, почему linaria - лучшее решение для стилизации приложения](https://www.youtube.com/watch?v=hAmd7cINqAU)

## README слоев

- Common Utils: [`packages/common-utils/README.md`](packages/common-utils/README.md)
- Config (`AppConfig`, `window._ENV_`, `global.d.ts`): [`packages/app/README.md`](packages/app/README.md)
- Design Tokens (Figma -> Tailwind): [`packages/ui-kit/README.md`](packages/ui-kit/README.md)
- CSS Variables (валидация + автокомплит): [`packages/ui-kit/README.md`](packages/ui-kit/README.md), [`packages/common-utils/README.md`](packages/common-utils/README.md)
- CSS Modules (`.d.ts` + `.d.ts.map`): [`packages/ui-kit/README.md`](packages/ui-kit/README.md), [`packages/app/README.md`](packages/app/README.md), [`packages/common-utils/README.md`](packages/common-utils/README.md)
- Test Locators (`data-testid` контракт): [`packages/app/README.md`](packages/app/README.md), [`packages/e2e-tests/README.md`](packages/e2e-tests/README.md)
- API (typed client + доменные слои): [`packages/app/README.md`](packages/app/README.md)
- MobX (BaseStore, stores, observer rule): [`packages/app/README.md`](packages/app/README.md), [`packages/common-utils/README.md`](packages/common-utils/README.md)
- Routing (типизированное дерево роутов): [`packages/app/README.md`](packages/app/README.md)
- Storybook (app/ui-kit сценарии): [`packages/app/README.md`](packages/app/README.md), [`packages/ui-kit/README.md`](packages/ui-kit/README.md)
- Локализация (`i18next` + типизация ключей): [`packages/app/README.md`](packages/app/README.md)
- Иконки (Figma -> icon font + typed exports): [`packages/icons/README.md`](packages/icons/README.md)
- Feature Toggles (схема + safe normalization): [`packages/feature-toggles/README.md`](packages/feature-toggles/README.md), [`packages/app/README.md`](packages/app/README.md)

## Пакеты в монорепе

- `packages/app`
- `packages/ui-kit`
- `packages/icons`
- `packages/common-utils`
- `packages/feature-toggles`
- `packages/e2e-tests`

## Быстрый старт

```bash
npm i
```

## Общие команды монорепы

- `npm run prepare` - установка git hooks (`lefthook install`)
- `npm run postinstall` - после установки зависимостей собирает `@demo/ui-kit` и `@demo/common-utils`
- `npm run lint` - общий запуск prettier + eslint + stylelint
- `npm run lint:fix` - тоже самое, но с автопочинкой
- `npm run generate:css-vars-autocomplete` - генерация автокомплита CSS vars для IDE

## CSS Vars: важные детали (общие для монорепы)

- В stylelint подключено правило `css-vars/valid-css-vars`.
- Валидные токены берутся из `packages/ui-kit/src/styles/generated/TWClassNames.js`.
- Исключения лежат в `packages/common-utils/scripts/stylelint-plugin-css-vars/ignoredCSSVars.js`.
- Диагностика новых/подозрительных переменных:

```bash
node packages/common-utils/scripts/stylelint-plugin-css-vars/find-css-vars-errors.js
```

Скрипт генерирует отчёт `packages/common-utils/scripts/stylelint-plugin-css-vars/CSSVarsErrors.js`.

## WebStorm: подключение CSS vars templates

После генерации автокомплита создается файл:

- `.idea/liveTemplates/demo-css-vars.xml`

Чтобы WebStorm подхватил шаблоны, один раз создайте symlink в папку templates вашей версии IDE:

```bash
# ВАША_ВЕРСИЯ_WEBSTORM, например: WebStorm2025.3
mkdir -p ~/Library/Application\ Support/JetBrains/ВАША_ВЕРСИЯ_WEBSTORM/templates
ln -sf ВАШ_ПУТЬ_К_ПРОЕКТУ/.idea/liveTemplates/demo-css-vars.xml \
~/Library/Application\ Support/JetBrains/ВАША_ВЕРСИЯ_WEBSTORM/templates/demo-css-vars.xml
```

Дальше в CSS/SCSS внутри `var(...)` можно вызывать шаблоны через `Cmd+J`.

## Корневые файлы монорепы

- `.vscode/settings.json`  
  Закрепляет единое поведение VS Code в проекте:

  - `editor.formatOnSave: true` - форматирование при сохранении
  - `editor.defaultFormatter: esbenp.prettier-vscode` - единый форматтер Prettier
  - `prettier.requireConfig: true` - Prettier работает только при наличии проектного `.prettierrc` (чтобы не применялись глобальные пользовательские настройки)
  - `stylelint.validate: [css, scss]` - включает stylelint-проверку для CSS/SCSS
  - `editor.codeActionsOnSave.source.fixAll.stylelint: explicit` - автофиксы stylelint выполняются только при явном действии, чтобы не делать агрессивные правки при каждом сохранении

- `.prettierrc`  
  Общие правила форматирования.  
  Так же подключает `@trivago/prettier-plugin-sort-imports` для сортировки и группировки импортов.

- `eslint.config.js`  
  Единый ESLint flat config для всей монорепы (TS/React/Storybook/Tailwind и кастомные правила).

- `eslint-batch.js`  
  Пакетный запуск ESLint большими батчами файлов (по 1000), чтобы не упираться в память на больших объемах кода.  
  Используется командой `npm run lint:eslint:batch`.

- `stylelint.config.mjs`  
  Единый Stylelint config монорепы, включая кастомное правило `css-vars/valid-css-vars`.

- `lefthook.yml`  
  Git hooks для pre-commit: eslint, prettier, stylelint, type-check app и `typograf-locales`.

- `global.d.ts` (в корне)  
  Вспомогательные декларации типов для инструментов из JS-конфигов (ESLint plugins/parser).  
  Не путать с `packages/app/src/global.d.ts`, где описаны runtime-типизации приложения.

- `tsconfig.json`  
  Базовый TypeScript config для workspace.

- `tsconfig.eslint.json`  
  Отдельный tsconfig для типизации JS-конфигов и служебных файлов линтинга в корне.
