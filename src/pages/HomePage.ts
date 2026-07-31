import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { URLS } from '../constants/urls';

export class HomePage extends BasePage {
  // Locators
  private jobsTab: Locator;

  constructor(page: Page) {
    super(page);

    // Use role-based locator for Jobs - works on both desktop and mobile
    // Try to find Jobs link with or without exact match (mobile may have different structure)
    this.jobsTab = page
      .getByRole('link', { name: 'Jobs', exact: true })
      .or(page.getByRole('link', { name: /jobs/i }))
      .first();
  }

  /**
   * Navigate to home page
   */
  async navigate(): Promise<void> {
    await this.goto(URLS.homePage);
  }

  /**
   * Click on Jobs tab in navigation
   * This should navigate to the jobs page
   */
  async clickJobsTab(): Promise<void> {
    // Use longer timeout for mobile navigation (15 seconds)
    await this.jobsTab.waitFor({ timeout: 15000 });
    await this.jobsTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if Jobs tab is visible
   */
  async isJobsTabVisible(): Promise<boolean> {
    return await this.jobsTab.isVisible();
  }
}