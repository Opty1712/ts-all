import {EnvConfig} from '@/types/EnvConfig';

const DefaultConfig: EnvConfig = {
  /** переключаем в .storybook/preview.tsx */
  IS_STORYBOOK: false,

  API_URL: process.env.API_URL || '',

  IS_PROD: Boolean(process.env.IS_PROD),

  /** true не комитим */
  IS_FEATURE_TOGGLES_MOCKED: false,
};

export const APP_CONFIG: EnvConfig = {...DefaultConfig, ...window._ENV_};
