export type IsFn<T> = (value: unknown) => value is T;

export type FieldValidator<T> = {
  is: IsFn<T>;
  fallback: T;
};

export type Field<T> = {
  description: string;
  labels?: Array<string>;
  value: FieldValidator<T>;
};

export type FieldValidatorBuilder<T> = (fallback?: T) => FieldValidator<T>;

export type ConfigSchema = Record<string, Field<unknown>>;

export type InferConfigType<T extends ConfigSchema> = {
  [P in keyof T]: T[P] extends Field<infer U> ? U : never;
};

export type FeatureToggleConfigResponseType<ConfigType extends Record<string, unknown>> = ConfigType;
