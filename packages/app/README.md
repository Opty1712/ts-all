# @demo/app

Демо frontend-приложение к докладу про типизацию слоев.

README описывает:

- как запустить `app`
- какие кейсы из доклада реализованы в коде
- где находится реализация каждого кейса

## Что это за приложение

SPA на React + TypeScript + MobX + Wouter.

Использует пакеты монорепы:

- `@demo/ui-kit` - стили/компоненты
- `@demo/icons` - иконки
- `@demo/common-utils` - общие утилиты
- `packages/feature-toggles` - схема и безопасная нормализация feature toggles

## Запуск

1. Установить зависимости в корне монорепы:

```bash
npm i
```

2. Запустить app (frontend + mock backend):

```bash
npm run dev
```

3. Запустить Storybook app:

```bash
npm run storybook
```

## Скрипты пакета

- `npm run dev` - параллельно `dev:frontend` и `dev:backend`
- `npm run dev:frontend` - Vite + watch для typed CSS modules
- `npm run dev:backend` - локальный mock server (`dev-server/server.ts`), это отдельный вспомогательный сервис для эмуляции backend API в демо (GET/POST сценарии), не часть runtime production-приложения
- `npm run storybook` - Storybook app
- `npm run type-check` - проверка типовой целостности: генерация типов CSS Modules и проверка TypeScript-контрактов приложения
- `npm run typed-css` - генерация `.d.ts` и `.d.ts.map` для CSS Modules
- `npm run typed-css:dev` - watch-режим `typed-css`
- `npm run typed-css:remove` - удаление сгенерированных `*.module.css.d.ts` и `*.module.css.d.ts.map` (кроме `node_modules/dist/build`)
- `npm run typograf-locales` - типографская обработка локалей (запускается в `lefthook` на `pre-commit`)

## Кейсы из доклада и где они реализованы

### 1) Конфиг приложения и типизация окружения

- `src/config/appConfig.ts` - единый `APP_CONFIG` с флагами:
  - `IS_STORYBOOK`
  - `IS_PROD`
  - `IS_FEATURE_TOGGLES_MOCKED`
  - `API_URL`
- `src/types/EnvConfig.ts` - контракт env-конфига
- `src/global.d.ts`:
  - типизация `window._ENV_`
  - декларации для CSS-модулей
  - патч типов `mobx` для используемого decorator/accessor-паттерна
- `src/index.html` - подключение внешнего `/cpa/env.js`

### 2) API-контракт + адаптеры

- `src/network/api.ts` - typed `apiClient` поверх `wretch` (`get/post`, generic-ответы и ошибки)
- каждый домен в `src/network/*` оформлен отдельной папкой (`books`, `authors`, `featureToggles`) с одинаковой ролью слоев:
  - `urls.ts` - endpoint-константы домена
  - `types.ts` - контракт данных домена
  - `*Api.ts` - typed функции запросов домена
  - `mocks/*` - mock-ответы домена для dev/story сценариев
  - `adapt*.ts` - адаптер backend -> UI при необходимости (пример: `src/network/books/adaptBook.ts`, `priceKopecks -> price`)

### 3) MobX как центральный слой + mini-react-query паттерн

- `src/stores/BaseStore.ts`:
  - фабрики `createGetter` / `createUpdater`
  - статусы `idle/loading/success/error`
  - кэш + `staleTimeMs`
  - дедупликация одинаковых запросов
  - `updateData`, `reset`
  - отдельный режим для Storybook: при `APP_CONFIG.IS_STORYBOOK` сетевой запрос не выполняется, стор возвращает успешный результат из текущих данных
- конкретные stores:
  - `src/stores/AuthorsStore.ts`
  - `src/stores/BooksStore.ts`
  - `src/stores/FeatureToggleStore.ts`

### 4) Типизированный useStores + защита observer

- `src/stores/StoresProvider.tsx` - typed `useStores`, `resetStores`
- `src/stores/index.ts` - фабрика инстансов stores
- линтер-правило для `observer`:
  - `packages/common-utils/scripts/eslint-plugin-mobx.js`
  - подключение: `eslint.config.js` правило `mobx/require-observer-with-usestores`

### 5) Типизированный роутинг как дерево

- `src/router/routes.ts`:
  - дерево роутов
  - вывод `APP_ROUTES`
  - `getDynamic(params)` для динамических сегментов: принимает `string` или типизированный объект параметров и собирает корректный URL
  - `getRouteByPath(pathname)` - возвращает описание роута из `APP_ROUTES` для текущего URL (с поддержкой динамических сегментов)
  - `getRouteParam(route, param)` - безопасно читает параметр из `route.params` с типизацией ключа и значения
- использование:
  - `src/router/Router.tsx`
  - страницы и `Layout` используют `APP_ROUTES` вместо строковых URL

### 6) Storybook как среда (инъекция данных в stores)

- `/.storybook/preview.tsx`:
  - переключает `APP_CONFIG.IS_STORYBOOK = true`
  - поднимает `StoresProvider` и `i18n`
  - отключает `mobx enforceActions` для сценариев моков (это строгий режим MobX, который разрешает менять observable-состояние только внутри actions; в Storybook это снимается, чтобы можно было напрямую подставлять мок-данные в store)
- пример инъекции моков в store:
  - `src/pages/Books/BooksPage.stories.tsx`
  - `src/pages/Books/BooksPage.mocks.ts`
  - выбор сценария типизирован через `keyof typeof BOOKS_PAGE_MOCKS`

### 7) Feature toggles: типизированная схема + fallback

- схема:
  - `src/consts/featureToggles.ts`
- вывод типа:
  - `src/types/featureToggles.ts`
- безопасная нормализация:
  - `src/stores/FeatureToggleStore.ts` (`makeConfigSafe(...)`)
- два варианта использования в приложении:
  - через store: `$omicronStore.getOmicronConfig.data` (пример: `src/components/Layout/Layout.tsx`)
  - через хук-обертку: `useFeatureToggles()` (файл: `src/hooks/useFeatureToggles.ts`, пример: `src/pages/Authors/AuthorsPage.tsx`)
- сам пакет схемы/валидаторов:
  - `packages/feature-toggles/*`

### 8) Локализация: типизированные ключи + reactive t()

- `src/i18n/constants.ts` - источник `defaultNS` и `resources` (карта подключенных локалей), от него строится типизация ключей
- `src/i18n/i18n.d.ts` - расширение типов `i18next` под ресурсы проекта (типобезопасные ключи переводов)
- `src/i18n/types.ts` - `TRanslationKey` как `keyof` от `ru` ресурсов
- `src/i18n/i18nHelper.ts` - реактивная функция перевода `t()` для кода вне React-компонентов
- локали:
  - `src/i18n/locales/ru.json`
  - `src/i18n/locales/en.json`
- типограф для локалей:
  - `scripts/typograf-locales.ts`

### 9) Типизированные test locators

- источник test ids:
  - `src/components/Layout/LayoutData.testIds.ts`
- использование в UI:
  - `src/components/Layout/Layout.tsx` (`data-testid`)
- связка с e2e:
  - `packages/e2e-tests/layout.test.ts` импортирует те же test ids

### 10) CSS Modules типизация и переход в исходный CSS

- `typed-css` и `typed-css:dev` генерируют:
  - `*.module.css.d.ts`
  - `*.module.css.d.ts.map`
- генерация `*.module.css.d.ts.map` делегирована в:
  - `packages/common-utils/scripts/generateCssDtsMaps.js`
- `typed-css:remove` удаляет ранее сгенерированные `*.module.css.d.ts` и `*.module.css.d.ts.map`

### 11) UI-kit и иконки в app

- подключение ui-kit стилей:
  - `src/main.tsx` -> `@demo/ui-kit/lib/style.css`
- подключение иконок:
  - `src/main.tsx` -> `@demo/icons/dist/style.css`
- подробности по этим слоям:
  - [`packages/ui-kit/README.md`](../ui-kit/README.md)
  - [`packages/icons/README.md`](../icons/README.md)

## Локальный mock backend

- реализация:
  - `dev-server/server.ts`
  - `dev-server/mocks.ts`
- API:
  - `GET /authors`, `GET /authors?id=...`, `POST /authors/favorite`
  - `GET /books`, `GET /books?id=...&author=...`, `POST /books/favorite`
  - `GET /feature-toggles`

## Что из доклада осознанно не реализовано в этом пакете

Некоторые экспериментальные части из доклада (например, универсальный mock-mode для всего API и runtime-генерация схем из моков) в этом демо-пакете намеренно не реализованы, потому что для текущего учебного сценария они не дают практической пользы и только усложняют поддержку.
