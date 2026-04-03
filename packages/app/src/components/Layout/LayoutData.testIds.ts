import {generateTestIds} from '@demo/common-utils';

export const layoutDataTestIdsList = ['menuTopHome', 'menuTopAuthors', 'menuTopBooks', 'header'] as const;

export const layoutDataTestIds = generateTestIds(layoutDataTestIdsList);
