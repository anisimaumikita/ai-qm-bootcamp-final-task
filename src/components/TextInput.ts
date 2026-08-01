import type { Locator } from '@playwright/test';

export class TextInput {
  constructor(private locator: Locator) {}

  async fill(text: string): Promise<void> {
    await this.locator.fill(text);
  }

  async getValue(): Promise<string> {
    return (await this.locator.inputValue()) || '';
  }

  async clear(): Promise<void> {
    await this.locator.fill('');
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
