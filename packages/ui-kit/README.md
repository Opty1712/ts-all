# @demo/ui-kit

UI-kit демо-проекта к докладу про типизацию разных слоев frontend.

Пакет показывает, как типизировать и валидировать:

- дизайн-токены из Figma
- темы и Tailwind-конфигурацию
- CSS-переменные
- CSS Modules
- className-контракты компонентов
- интеграцию со Storybook

## Структура

- `src/components` - React-компоненты
- `src/styles` - токены, базовые стили, генераторы
- `src/styles/generated` - автогенерируемые файлы (не редактируются вручную)
- `scripts` - служебные скрипты сборки и копирования
- `.storybook` - конфигурация Storybook

## Быстрый старт

1. Установить зависимости в корне монорепы:

```bash
npm i
```

2. Запустить UI-kit в режиме разработки (Storybook + watch-режимы):

```bash
npm run dev
```

Команду запускать из `packages/ui-kit`.

## Скрипты пакета

- `npm run dev` - дев-режим: парсинг токенов, tailwind watch, typed-css watch, сборка watch, Storybook
- `npm run build` - production-сборка UI-kit
- `npm run css` - парсинг Figma-токенов в `src/styles/generated`
- `npm run tailwind:build` - генерация `tailwindOutputFile.css`
- `npm run tailwind:watch` - watch для tailwind
- `npm run typed-css` - генерация `.d.ts` для CSS Modules + `.d.ts.map`
- `npm run typed-css:dev` - watch-режим typed-css + `.d.ts.map`
- `npm run type-check` - проверка типов

## Работа со стилями

В пакете используются Tailwind, CSS Modules и генерация типизации/валидации для style-контрактов.

Короткий pipeline:

- импорт переменных из Figma
- генерация служебных файлов и типов
- генерация Tailwind CSS
- генерация `.d.ts` для CSS Modules
- финальная сборка и копирование `dist -> lib`

## Импорт переменных из Figma

1. Открыть Figma-файл с токенами.
2. Если нет прав редактирования, сделать дубликат файла: https://help.figma.com/hc/en-us/articles/360038511533-Duplicate-or-copy-files
3. Убедиться, что в Figma выключен dev-mode (в нем плагины не запускаются).
4. Запустить плагин Design Tokens Manager: https://www.figma.com/community/plugin/1263743870981744253/design-tokens-manager
5. Экспортировать токены через `Export -> Download`.
6. Положить архив `design-tokens.zip` в `src/styles`.
7. Повторить для второго файла Figma, сгенерировать в нем `design-tokens-b2b.zip` и также положить в `src/styles`.
8. Запустить генерацию:

```bash
npm run css
```

## Дизайн-токены (Figma -> код)

Источник правды - Figma Variables. Для демо используются два архива в `src/styles`:

- `design-tokens.zip`
- `design-tokens-b2b.zip`

Токены парсятся скриптом `npm run css`, результат попадает в `src/styles/generated`.

Основные артефакты генерации:

- `unzipped-tokens/` - распакованные токены
- `tailwindInitialFile.css` - входной CSS для Tailwind
- `tailwindTheme.json` - ключи нецветовых токенов; используется в ESLint-конфигурации для валидации допустимых `className`
- `tailwindLightColors.json` - светлая тема; используется в ESLint-конфигурации для валидации допустимых `className`
- `tailwindDarkColors.json` - темная тема
- `TWClassNames.ts` - union-типы допустимых Tailwind/CSS token-классов
- `TWClassNames.js` используется Stylelint-плагином как allow-list CSS-переменных
- `types.ts` - union токенов цветов (`FigmaColorToken`), может использоваться для строгой типизации токен-пропсов

Сгенерированные файлы не редактируются вручную.

## Tailwind и темы

`tailwind.config.js` использует файлы из `src/styles/generated` и собирает только разрешенные токен-классы, а также явно добавленные кастомные классы из `src/styles/customCSS.json` через `scripts/customCSSPlugin.js`.  
Итоговый CSS генерируется в `src/styles/generated/tailwindOutputFile.css`.

По умолчанию большинство базовых `corePlugins` Tailwind отключено в `tailwind.config.js`, чтобы набор утилит оставался контролируемым и не выходил за рамки токен-контрактов.

Далее файл импортируется в `src/index.ts`, поэтому попадает в итоговую сборку пакета.

Если нужно добавить новую группу утилит для токенов, обновляйте маппинг `themeKeysToVariableKeys` в `src/styles/parseFigmaTokens.js`, затем запускайте `npm run css`.

Пример: чтобы добавить поддержку `gap-spacing{token}`, в `themeKeysToVariableKeys` должен быть маппинг `gap -> spacing`.

Если после регенерации токенов линтер продолжает ругаться на `className`, перезапустите ESLint-сервер/процесс в IDE.

## Финальный билд

`src/index.ts` импортирует `src/styles/generated/tailwindOutputFile.css`, поэтому Vite кладет итоговый CSS вместе с JS/типами в `dist`.

Для стабильного dev-потока используется скрипт `scripts/copyDistToLib.js`: после сборки содержимое `dist` копируется в `lib`.

## CSS-переменные и автокомплит

В монорепе используется кастомная валидация CSS vars через Stylelint-плагин:

- `packages/common-utils/scripts/stylelint-plugin-css-vars/plugin.js`

Разрешенный список CSS-переменных берется из сгенерированного файла:

- `src/styles/generated/TWClassNames.js`

Этот файл читает Stylelint-плагин, и на его основе валидирует `var(--token)` в стилях.

После `npm run build` автоматически вызывается генерация автокомплита CSS vars:

- `.vscode/demo-css-vars.code-snippets` для VS Code
- `.idea/liveTemplates/demo-css-vars.xml` для WebStorm

Это дает подсказки по реальным токенам и снижает ошибки при работе с `var(--...)`.

Для общего Tailwind IntelliSense:

- VS Code: рекомендуется плагин `bradlc.vscode-tailwindcss`
- WebStorm: встроенная поддержка Tailwind, документация: https://www.jetbrains.com/help/webstorm/tailwind-css.html

## CSS Modules: типы и навигация

Для каждого `*.module.css` генерируются:

- `*.module.css.d.ts`
- `*.module.css.d.ts.map`

Что это дает:

- автокомплит классов
- защита от опечаток на этапе TypeScript
- переход из TS/TSX в исходный CSS (через map)

Генерация `.d.ts.map` выполняется скриптом:

- `packages/common-utils/scripts/generateCssDtsMaps.js`

## Кастомные общие классы

Если нужен повторно используемый кастомный класс, добавляйте его в:

- `src/styles/customCSS.json`

## Storybook

Конфигурация находится в `.storybook`.

Локальный запуск Storybook включен в `npm run dev`.  
Отдельной команды статической сборки в текущем `package.json` нет.

## Иконки

- Подключать стили иконок: `@demo/icons/dist/style.css`
- Использовать иконки через экспорт из `@demo/icons` (например `import {IconAdd16} from '@demo/icons'`)

## Сборка и экспорт

Основная точка входа:

- `src/index.ts`

Публичные компоненты реэкспортируются через:

- `src/components/index.ts`

Сборка создается в `dist`, затем копируется в `lib` (используется скрипт `scripts/copyDistToLib.js` для стабильного dev-потока).

Пример использования:

```ts
import {Badge} from '@demo/ui-kit';
```
