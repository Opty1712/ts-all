# e2e-tests

Минимальный Playwright e2e-слой для демо-проекта.

Текущее назначение пакета:

- показать типизированный подход к работе с `data-testid`
- связать локаторы Playwright с контрактом test ids из `@demo/app`

## Что есть сейчас

- `basicClass.ts`
  Базовый generic-класс, который строит типизированный объект `locators` через `page.getByTestId(...)`.

- `layout.test.ts`  
  Реальный Playwright-тест и page object `Layout`, который использует реальные test ids из `packages/app/src/components/Layout/LayoutData.testIds.ts`.

## Как запустить

Из корня репозитория:

```bash
npm run test -w e2e-tests
```

Playwright сам:

1. собирает `@demo/app`
2. поднимает preview-сервер
3. открывает страницу и проверяет типизированные локаторы меню

## Контракт с app

Источник test ids:

- `packages/app/src/components/Layout/LayoutData.testIds.ts`

Использование на странице:

- `packages/app/src/components/Layout/Layout.tsx` (`data-testid={item.testId}`)

Это дает типобезопасную связку:

1. test ids объявляются один раз в `app`
2. e2e-слой импортирует тот же объект ids
3. page object получает типизированные `locators`
4. опечатки в именах ловятся TypeScript еще до запуска теста
