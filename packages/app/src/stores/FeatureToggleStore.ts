import {FeatureToggleConfigSchema} from '@/consts/featureToggles';
import {getFeatureToggleConfig} from '@/network/featureToggles/featureTogglesApi';
import {BaseStore, Getter} from '@/stores/BaseStore';
import {FeatureToggleConfig} from '@/types/featureToggles';
import {makeObservable, observable} from 'mobx';

import {makeConfigSafe} from '../../../feature-toggles';

export class FeatureToggleStore extends BaseStore {
  @observable public accessor getOmicronConfig: Getter<void, FeatureToggleConfig, FeatureToggleConfig, true>;

  constructor() {
    super();
    makeObservable(this);

    this.getOmicronConfig = this.createGetter({
      fetchFn: getFeatureToggleConfig,
      staleTimeMs: 10000,
      adaptDataFromBackend: (data) => makeConfigSafe<FeatureToggleConfig>(FeatureToggleConfigSchema, data),
      defaultData: makeConfigSafe<FeatureToggleConfig>(FeatureToggleConfigSchema, {}),
    });
  }
}
