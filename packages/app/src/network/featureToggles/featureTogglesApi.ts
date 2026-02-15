import {APP_CONFIG} from '@/config/appConfig';
import {APP_DEFAULT_OMICRON_CONFIG} from '@/consts/featureToggles';
import {t} from '@/i18n/i18nHelper';
import {Answer, apiClient} from '@/network/api';
import {FeatureToggle} from '@/types/featureToggles';

export async function getFeatureToggleConfig(): Promise<Answer<FeatureToggle>> {
  if (!APP_CONFIG.IS_PROD && APP_CONFIG.IS_FEATURE_TOGGLES_MOCKED) {
    return {data: APP_DEFAULT_OMICRON_CONFIG, code: 200, error: null};
  }

  const response = await apiClient.get<FeatureToggle>('/feature-toggles');

  if (!response.data) {
    return {
      ...response,
      error: response.error ?? {
        code: 'ERROR',
        body: null,
        message: t('Произошла ошибка'),
        timestamp: Date.now().toString(),
      },
    };
  }

  return response;
}
