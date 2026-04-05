import {useStores} from '@/stores/StoresProvider';

export const useFeatureToggles = () => {
  const {$ftStore} = useStores();
  const config = $ftStore.getFTConfig.data;

  return config;
};
