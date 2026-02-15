export const getEntries = <T extends Record<string | number | symbol, unknown>>(
  object: T,
): Array<[keyof T, T[keyof T]]> => {
  return Object.entries(object) as Array<[keyof T, T[keyof T]]>;
};
