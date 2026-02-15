# e2e-tests

Пакет-заготовка для e2e слоя в демо-проекте.

Текущее назначение пакета:

- показать типизированный подход к работе с `data-testid`
- связать локаторы Playwright с контрактом test ids из `@demo/app`

## Что есть сейчас

- `appModel.ts`  
  Базовые абстракции `BasicModel` / `AppModel`, которые строят типизированные локаторы через `page.getByTestId(...)`.

- `layout.test.ts`  
  Пример page model `Layout`, который использует реальные test ids из `packages/app/src/components/Layout/LayoutData.testIds.ts`.

## Важный статус

В текущем состоянии пакет **не содержит запускаемых e2e-тестов**:

- нет `playwright.config.ts` в репозитории
- в `packages/e2e-tests/package.json` нет `scripts` для запуска
- `layout.test.ts` содержит модель/пример, а не `test(...)`-кейсы

## Контракт с app

Источник test ids:

- `packages/app/src/components/Layout/LayoutData.testIds.ts`

Использование на странице:

- `packages/app/src/components/Layout/Layout.tsx` (`data-testid={item.testId}`)

Это дает типобезопасную связку:

1. test ids объявляются один раз в `app`
2. e2e-слой импортирует тот же объект ids
3. опечатки в именах ловятся TypeScript
