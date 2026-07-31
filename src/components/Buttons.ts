import type { Page } from '@playwright/test';

export class Button {
  constructor(private page: Page, private selector: string) {}

  async click() {
    await this.page.click(this.selector);
  }

  async getText(): Promise<string | null> {
    return this.page.locator(this.selector).textContent();
  }
}