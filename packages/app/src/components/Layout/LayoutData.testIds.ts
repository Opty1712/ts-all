import {generateTestIds} from '@demo/common-utils';

const layoutDataTestIdsList = [
  'menuTopHome',
  'menuTopAuthors',
  'menuTopBooks',
  'header',
] as const;

export const layoutDataTestIds = generateTestIds(layoutDataTestIdsList);
