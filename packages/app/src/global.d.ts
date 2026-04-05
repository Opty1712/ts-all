/* eslint-disable @typescript-eslint/no-explicit-any */
import {EnvConfig} from '@/types/EnvConfig';
import 'mobx';

declare global {
  interface Window {
    _ENV_: EnvConfig;
  }
}

declare module 'mobx' {
  // Преопределим CreateObservableOptions, чтобы убрать конфликт типов
  interface CreateObservableOptions {
    // Позволяет использовать property декораторы с возвращаемым TypedPropertyDescriptor
    proxy?: boolean;
    deep?: boolean;
    name?: string;
    equals?: (a: any, b: any) => boolean;
    defaultDecorator?: VoidFunction;
  }

  // Позволяет использовать @observable как property decorator с descriptor
  function observable(
    target: any,
    propertyKey: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ): void;
}
