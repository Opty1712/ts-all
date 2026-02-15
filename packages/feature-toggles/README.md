# feature-toggles

Утилиты для типобезопасной схемы feature toggles в демо-проекте.

Пакет решает две задачи:

- описать контракт конфигурации фич через схему
- безопасно привести произвольный объект к этому контракту с fallback-значениями

Сейчас модуль используется локально из монорепы, импорты через `../../../feature-toggles`.

## Публичный API

Экспортируется из `index.ts`:

- `getDefaultConfig(schema)` - собирает конфиг целиком из fallback-значений схемы
- `makeConfigSafe(schema, config)` - приводит произвольный объект к безопасному конфигу по схеме
- `makeResponseSafe(schema, response)` - алиас над `makeConfigSafe` для сценария ответа API
- `getBoolean(fallback?)` - валидатор boolean, fallback по умолчанию `false`
- `getStringArray(fallback?)` - валидатор `string[]`, fallback по умолчанию `[]`
- типы `ConfigSchema`, `InferConfigType`

## Структура

- `types.ts` - типы схемы и вывод результирующего типа
- `validators.ts` - билдеры валидаторов (`getBoolean`, `getStringArray`)
- `helpers.ts` - `getDefaultConfig`, `makeConfigSafe`, `makeResponseSafe`
- `index.ts` - публичные экспорты

## Модель схемы

Схема (`ConfigSchema`) - это объект полей, где каждое поле имеет:

- `description: string` - описание флага
- `labels?: string[]` - опциональные метки
- `value: { is, fallback }` - валидатор и fallback

`fallback` используется, если значение отсутствует или не проходит проверку `is`.

## Пример схемы

Реальный пример в проекте: `packages/app/src/consts/featureToggles.ts`.

```ts
import {ConfigSchema, getBoolean, getStringArray} from '../../../feature-toggles';

export const FeatureToggleConfigSchema = {
  DARK_THEME_ENABLED: {
    description: 'Темная тема',
    value: getBoolean(),
  },
  ALLOWED_AUTHORS_ID: {
    description: 'Разрешенные к показу авторы',
    value: getStringArray(),
  },
} satisfies ConfigSchema;
```

## Вывод типов из схемы

```ts
import {FeatureToggleConfigSchema} from '@/consts/featureToggles';

import {InferConfigType} from '../../../feature-toggles';

export type FeatureToggleConfig = InferConfigType<typeof FeatureToggleConfigSchema>;
// {
//   DARK_THEME_ENABLED: boolean;
//   ALLOWED_AUTHORS_ID: string[];
// }
```

## Использование в проекте

### 1) Вывод итогового типа из схемы

```ts
import {FeatureToggleConfigSchema} from '@/consts/featureToggles';

import {InferConfigType} from '../../../feature-toggles';

type FeatureToggleConfig = InferConfigType<typeof FeatureToggleConfigSchema>;
```

Файл: `packages/app/src/types/featureToggles.ts`.

### 2) Нормализация данных ответа API в Store

```ts
import {FeatureToggleConfigSchema} from '@/consts/featureToggles';
import {FeatureToggleConfig} from '@/types/featureToggles';
import {makeConfigSafe} from '../../../feature-toggles';

adaptDataFromBackend: (data) => makeConfigSafe<FeatureToggleConfig>(FeatureToggleConfigSchema, data),
defaultData: makeConfigSafe<FeatureToggleConfig>(FeatureToggleConfigSchema, {}),
```

Файл: `packages/app/src/stores/FeatureToggleStore.ts`.

Правила работы `makeConfigSafe` (по текущей реализации `helpers.ts`):

- если `config` не объект (`null`, `undefined`, строка, число), возвращаются fallback-значения
- каждое поле проверяется через `value.is`
- если тип не совпал, подставляется `value.fallback`
- ключи, которых нет в схеме, не попадают в результат

## Расширение валидаторов

Если нужно поддержать новые типы (например, `number`, enum-подобные строки, сложные объекты), добавляется новый валидатор в `validators.ts`.

Главное правило: любой валидатор должен возвращать объект `{ is, fallback }`.
