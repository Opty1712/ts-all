import type {FieldValidatorBuilder} from './types';

export const getBoolean: FieldValidatorBuilder<boolean> = (fallback = false) => ({
  is: (value): value is boolean => typeof value === 'boolean',
  fallback,
});

export const getStringArray: FieldValidatorBuilder<Array<string>> = (fallback = []) => ({
  is: (value): value is Array<string> => Array.isArray(value) && value.every((item) => typeof item === 'string'),
  fallback,
});
