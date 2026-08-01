import type { Locator } from '@playwright/test';

export class Button {
  constructor(private locator: Locator) {}

  async click(): Promise<void> {
    await this.locator.click();
  }

  async getText(): Promise<string> {
    return (await this.locator.textContent()) ?? '';
  }

  async waitFor(options?: { timeout?: number }): Promise<void> {
    await this.locator.waitFor(options);
  }

  async isVisible(options?: { timeout?: number }): Promise<boolean> {
    return this.locator.isVisible(options);
  }

  getLocator(): Locator {
    return this.locator;
  }
}
