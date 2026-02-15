# @demo/common-utils

Общий пакет утилит и типов для монорепы.

Пакет используется как:

- библиотека переиспользуемых экспортов (`src/index.ts`)
- хранилище инфраструктурных скриптов для других пакетов (`scripts/`)

## Публичные экспорты

Экспортируются из `src/index.ts`:

- `countries` и тип `CountryKey` (`src/countries.ts`)
- `getKeyValueObjectFromStrings` (`src/getKeyValueObjectFromStrings.ts`)
- `generateTestIds` (алиас над `getKeyValueObjectFromStrings`) (`src/generateTestIds.ts`)
- типы ответов: `ErrorMessage`, `ErrorMessages`, `ErrorResponse`, `ResponseCode` (`src/types/Responses.ts`)

## Основные сценарии использования

### Типизированные test ids

```ts
import {generateTestIds} from '@demo/common-utils';

const ids = ['menuTopHome', 'menuTopAuthors'] as const;
export const testIds = generateTestIds(ids);
// { menuTopHome: 'menuTopHome', menuTopAuthors: 'menuTopAuthors' }
```

### Сборка key-value объекта из строк

`getKeyValueObjectFromStrings` по умолчанию валидирует отсутствие дублей и бросает ошибку при повторяющихся значениях.

## Инфраструктурные скрипты (`scripts/`)

### 1) Stylelint-плагин для CSS vars

- Правило: `css-vars/valid-css-vars`
- Файл: `scripts/stylelint-plugin-css-vars/plugin.js`
- Источник валидных переменных: `packages/ui-kit/src/styles/generated/TWClassNames.js`
- Постоянный allow-list исключений: `scripts/stylelint-plugin-css-vars/ignoredCSSVars.js`

Сопутствующие скрипты:

- `scripts/stylelint-plugin-css-vars/generate-css-vars-list.js`  
  Генерирует автокомплит CSS vars:
  - `.vscode/demo-css-vars.code-snippets`
  - `.idea/liveTemplates/demo-css-vars.xml`
- `scripts/stylelint-plugin-css-vars/find-css-vars-errors.js`  
  Диагностика невалидных CSS vars в проекте.

Состав папки `scripts/stylelint-plugin-css-vars`:

- `plugin.js` - регистрация stylelint-правила `css-vars/valid-css-vars`
- `generate-css-vars-list.js` - генерация файлов автокомплита CSS vars для IDE
- `find-css-vars-errors.js` - скан `.module.css/.module.scss` и генерация отчета `CSSVarsErrors.js`
- `utils.js` - утилиты чтения `TWClassNames.js`, `ignoredCSSVars.js`, парсинга и обхода файлов
- `constants.js` - константы путей (`ROOT_DIR`, `TW_CLASS_NAMES_PATH`, output paths)
- `ignoredCSSVars.js` - ручной allow-list CSS vars, которых нет в ui-kit токенах

### 2) Генерация `.module.css.d.ts.map`

- Файл: `scripts/generateCssDtsMaps.js`
- Используется в `@demo/ui-kit` и `@demo/app` рядом с `typed-css-modules`
- Назначение: корректный переход из TS/TSX в исходный CSS Module

Запуск:

```bash
node packages/common-utils/scripts/generateCssDtsMaps.js
node packages/common-utils/scripts/generateCssDtsMaps.js --watch
```

### 3) ESLint-правило для MobX

- Файл: `scripts/eslint-plugin-mobx.js`
- Правило: `require-observer-with-usestores`
- Назначение: если компонент использует `useStores`, требовать обертку в `observer`

## Скрипты пакета

- `npm run build` - сборка пакета через Vite (`dist`)
- `npm run type-check` - проверка типов (`tsc --noEmit`)
