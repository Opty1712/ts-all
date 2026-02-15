import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from 'react-i18next';

import {defaultNS, resources} from './constants';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ru',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false,
    },
    lng: 'ru',
    ns: [defaultNS],
    defaultNS,
    resources,

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export {i18n};
