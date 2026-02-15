import {Locator, Page} from '@playwright/test';

export abstract class BasicModel<const T extends Record<string, string>> {
  protected page: Page;
  public testIds: T;
  protected locators: Record<keyof T, Locator>;

  protected constructor(page: Page, testIds: T) {
    this.page = page;
    this.testIds = testIds;

    this.locators = Object.entries(testIds).reduce(
      (acc, [key, value]) => {
        acc[key as keyof T] = page.getByTestId(value);

        return acc;
      },
      {} as Record<keyof T, Locator>,
    );
  }
}

export abstract class AppModel<const T extends Record<string, string>> extends BasicModel<T> {}
