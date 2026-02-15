import i18next, {TOptions} from 'i18next';

import {defaultNS} from './constants';
import {TRanslationKey} from './types';

type TFunction = (key: TRanslationKey, options?: TOptions) => string;

let reactiveT: TFunction | null = null;

const getReactiveT = (): TFunction => {
  if (!reactiveT) {
    if (!i18next.isInitialized) {
      return (key: string) => key;
    }

    reactiveT = i18next.getFixedT(null, defaultNS);
  }

  return reactiveT;
};

i18next.on('languageChanged', () => {
  reactiveT = null;
});

/** Реактивная `t()` для использования вне реакт компонентов и хуков */
export const t: TFunction = (key, options) => {
  return getReactiveT()(key, options);
};
