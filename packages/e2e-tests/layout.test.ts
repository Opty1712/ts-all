import {layoutDataTestIds} from '@demo/app/src/components/Layout/LayoutData.testIds';
import {APP_ROUTES} from '@demo/app/src/router/routes';
import {expect, Page, test} from '@playwright/test';

import {BasicClass} from './basicClass';

type LayoutDataTestIds = typeof layoutDataTestIds;

export class LayoutTest extends BasicClass<LayoutDataTestIds> {
  public constructor(page: Page) {
    super(page, layoutDataTestIds);
  }
}

test('layout uses typed Playwright locators from shared test ids', async ({
  page,
}) => {
  const layout = new LayoutTest(page);

  await page.goto('/');
  await layout.locators.menuTopBooks.click();
  await expect(page).toHaveURL(APP_ROUTES['/authors/books'].path);
});
