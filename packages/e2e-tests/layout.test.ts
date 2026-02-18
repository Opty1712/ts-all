import {layoutDataTestIds} from '@demo/app/src/components/Layout/LayoutData.testIds';
import {expect, Locator, Page} from '@playwright/test';

import {BasicClass} from './basicClass';

type LayoutDataTestIds = typeof layoutDataTestIds;

export class Layout extends BasicClass<LayoutDataTestIds> {
  private constructor(page: Page) {
    super(page, layoutDataTestIds);
  }

  public static new(page: Page): Layout & Record<keyof LayoutDataTestIds, Locator> {
    const _page = new Layout(page) as Layout & Record<keyof LayoutDataTestIds, Locator>;

    for (const key of Object.keys(layoutDataTestIds)) {
      _page[key] = _page.locators[key];
    }

    return _page;
  }

  public async methodToShowHowTestIdsAsLocatorsWork(): Promise<void> {
    await expect(this.locators.menuTopHome).toBeVisible();
    await expect(this.locators.menuTopAuthors).toBeVisible();
    await expect(this.locators.menuTopBooks).toBeVisible();
  }
}
