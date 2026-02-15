import {FeatureToggleConfig} from '@/types/featureToggles';

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

export const APP_DEFAULT_OMICRON_CONFIG: FeatureToggleConfig = {
  DARK_THEME_ENABLED: true,
  ALLOWED_AUTHORS_ID: ['1'],
};
