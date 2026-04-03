import {Locator, Page} from '@playwright/test';

type TestIds = Record<string, string>;

export type Locators<T extends TestIds> = {
  [K in keyof T]: Locator;
};

export abstract class BasicClass<const T extends TestIds> {
  protected readonly page: Page;
  public readonly locators: Locators<T>;

  protected constructor(page: Page, testIds: T) {
    this.page = page;

    this.locators = Object.fromEntries(
      Object.entries(testIds).map(([key, value]) => [key, page.getByTestId(value)]),
    ) as Locators<T>;
  }
}
