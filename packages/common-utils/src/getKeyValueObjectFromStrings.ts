/**
 * Из массива строк `['a', 'b']` создает объект вида `{a: 'a', b: 'b'}`.
 *
 * @typeParam T - Константный кортеж строк (например, `['a', 'b'] as const`).
 *
 * @param ids - Массив строковых идентификаторов.
 *              Значения будут использованы как ключи и как значения.
 * @param isRepeatAllowed - Флаг, разрешающий повторяющиеся значения в массиве.
 *                          По умолчанию `false`. Если `false` и найдены дубликаты — выбрасывается ошибка.
 *
 * @throws {Error} Если `isRepeatAllowed = false` и в массиве есть повторяющиеся значения.
 *
 * @returns Объект, где каждому элементу массива соответствует пара ключ–значение.
 *
 * @example
 * ```ts
 * getKeyValueObjectFromStrings(['a', 'b'] as const);
 * // => { a: 'a', b: 'b' }
 *
 * getKeyValueObjectFromStrings(['a', 'a'] as const);
 * // => Error: В массиве есть повторяющиеся значения
 *
 * getKeyValueObjectFromStrings(['a', 'a'] as const, true);
 * // => { a: 'a' } (последнее значение перезапишет предыдущее)
 * ```
 */
export const getKeyValueObjectFromStrings = <const T extends ReadonlyArray<string>>(
  ids: T,
  isRepeatAllowed?: boolean,
) => {
  if (!isRepeatAllowed && new Set(ids).size !== ids.length) {
    throw new Error('В массиве есть повторяющиеся значения');
  }

  return Object.fromEntries(ids.map((id) => [id, id])) as Record<T[number], T[number]>;
};
