import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get getPage(): Page {
    return this.page;
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async waitForURL(url: string | RegExp): Promise<void> {
    await this.page.waitForURL(url);
  }

  async click(selector: string): Promise<void> {
    await this.page.click(selector);
  }

  async fill(selector: string, text: string): Promise<void> {
    await this.page.fill(selector, text);
  }

  async type(selector: string, text: string): Promise<void> {
    await this.page.type(selector, text);
  }

  async getText(selector: string): Promise<string | null> {
    return await this.page.textContent(selector);
  }

  async isVisible(selector: string): Promise<boolean> {
    return await this.page.isVisible(selector);
  }

  async waitForSelector(selector: string): Promise<Locator> {
    return this.page.locator(selector).first();
  }

  async screenshot(path: string): Promise<void> {
    await this.page.screenshot({ path });
  }

  async pause(): Promise<void> {
    await this.page.pause();
  }
}
