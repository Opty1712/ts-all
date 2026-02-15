import {generateTestIds} from '@demo/common-utils';

export const layoutDataTestIdsList = ['menuTopHome', 'menuTopAuthors', 'menuTopBooks'] as const;

export const layoutDataTestIds = generateTestIds(layoutDataTestIdsList);
