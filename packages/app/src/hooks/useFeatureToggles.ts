import {useStores} from '@/stores/StoresProvider';

export const useFeatureToggles = () => {
  const {$omicronStore} = useStores();
  const config = $omicronStore.getOmicronConfig.data;

  return config;
};
