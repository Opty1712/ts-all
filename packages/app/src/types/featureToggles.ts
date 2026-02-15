import {FeatureToggleConfigSchema} from '@/consts/featureToggles';

import {InferConfigType} from '../../../feature-toggles';

export type FeatureToggleConfig = InferConfigType<typeof FeatureToggleConfigSchema>;

export type FeatureToggleConfigVariable = keyof FeatureToggleConfig;

export type FeatureToggle = FeatureToggleConfig;

export type Toggle = {
  [key in keyof FeatureToggleConfig]?: boolean;
};
