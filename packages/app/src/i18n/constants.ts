import ns1En from './locales/en.json';
import ns1Ru from './locales/ru.json';

export const defaultNS = 'ns1';

export const resources = {
  en: {
    ns1: ns1En,
  },
  ru: {
    ns1: ns1Ru,
  },
} as const;
