import {ConfigSchema, FeatureToggleConfigResponseType} from './types';

export const getDefaultConfig = <R extends Record<string, unknown>>(schema: ConfigSchema) => {
  return Object.entries(schema).reduce(
    (accumulator, [key, {value}]) => {
      accumulator[key] = value.fallback;

      return accumulator;
    },
    {} as Record<string, unknown>,
  ) as R;
};

export const makeConfigSafe = <R extends Record<string, unknown>>(
  schema: ConfigSchema,
  config: Record<string, unknown> | null | undefined,
): R => {
  if (!config || typeof config !== 'object') {
    return getDefaultConfig(schema);
  }

  return Object.entries(schema).reduce(
    (accumulator, [key, {value}]) => {
      const realValue = config[key];
      accumulator[key] = value.is(realValue) ? realValue : value.fallback;

      return accumulator;
    },
    {} as Record<string, unknown>,
  ) as R;
};

export const makeResponseSafe = <R extends Record<string, unknown>>(
  schema: ConfigSchema,
  response: FeatureToggleConfigResponseType<R> | null | undefined,
): FeatureToggleConfigResponseType<R> => {
  return makeConfigSafe<R>(schema, response);
};
