import type { Locator } from '@playwright/test';

export class Dropdown {
  constructor(private locator: Locator) {}

  async selectByLabel(label: string): Promise<void> {
    await this.locator.selectOption({ label });
  }

  async selectByValue(value: string): Promise<void> {
    await this.locator.selectOption(value);
  }

  async getSelectedValue(): Promise<string> {
    return (await this.locator.inputValue()) || '';
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
