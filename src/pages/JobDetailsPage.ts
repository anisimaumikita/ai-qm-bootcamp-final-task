/**
 * Job Details Page Object
 *
 * Represents the job details/job posting page.
 * Handles viewing and saving individual job details.
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class JobDetailsPage extends BasePage {
  // Locators
  private jobDetailTitle: Locator;
  private saveJobButton: Locator;
  private jobDescription: Locator;

  constructor(page: Page) {
    super(page);

    // Use role-based selectors - discovered via codegen
    this.jobDetailTitle = page.getByRole('heading').first();
    // Use .first() to handle strict mode - there are 2 Save buttons on the page
    this.saveJobButton = page.getByLabel('Save Job').first();
    this.jobDescription = page.locator('section').first();
  }

  /**
   * Get the job title from the details page
   */
  async getJobTitle(): Promise<string> {
    await this.jobDetailTitle.waitFor();
    const text = await this.jobDetailTitle.textContent();
    return text || '';
  }

  /**
   * Check if job title contains specific text
   * @param expectedText Text that should be in the job title
   */
  async jobTitleContains(expectedText: string): Promise<boolean> {
    const title = await this.getJobTitle();
    return title.toLowerCase().includes(expectedText.toLowerCase());
  }

  /**
   * Save the job by clicking Save button
   */
  async saveJob(): Promise<void> {
    await this.saveJobButton.waitFor();
    await this.saveJobButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Check if Save button is visible
   */
  async isSaveButtonVisible(): Promise<boolean> {
    return await this.saveJobButton.isVisible();
  }

  /**
   * Get job description text
   */
  async getJobDescription(): Promise<string> {
    try {
      await this.jobDescription.waitFor({ timeout: 3000 });
      const text = await this.jobDescription.textContent();
      return text || '';
    } catch {
      return '';
    }
  }
}
