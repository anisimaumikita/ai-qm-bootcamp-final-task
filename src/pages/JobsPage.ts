/**
 * Jobs Page Object
 *
 * Represents the IKEA jobs/careers page.
 * Handles job search, filtering, and navigation.
 *
 * NOTE: The actual selectors will need adjustment based on
 * real website structure. These are role-based and data-testid
 * based selectors which are more maintainable and stable.
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { URLS } from '../constants/urls';

export class JobsPage extends BasePage {
  // Locators for job exploration
  private exploreJobsButton: Locator;
  private searchJobTitleInput: Locator;
  private searchJobsButton: Locator;
  private firstJobItem: Locator;
  private jobTitle: Locator;
  private saveJobButton: Locator;
  private savedJobsBadge: Locator;
  private savedJobsTab: Locator;

  // Locators for subscription
  private emailInput: Locator;
  private categorySelect: Locator;
  private locationInput: Locator;
  private addJobAlertButton: Locator;
  private signUpButton: Locator;
  private confirmationMessage: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize job search locators - Selectors discovered via Playwright codegen
    this.exploreJobsButton = page.getByRole('link', { name: 'Explore available jobs' });
    this.searchJobTitleInput = page.getByRole('searchbox', { name: 'Keyword Search' });
    // Search button selector: use data-last-action with button--blue class
    // This specifically targets the form submit button (not the black navigation button)
    this.searchJobsButton = page.locator('button[data-last-action="search-submit"].button--blue');
    // First job link in search results - filter job links by having job titles
    this.firstJobItem = page
      .locator('a')
      .filter({ hasText: /Manager|Designer|Developer|Accountant|Customer/ })
      .first();
    this.jobTitle = page.getByRole('heading').first();
    this.saveJobButton = page.getByLabel('Save Job');
    // Saved jobs counter button shows as "Saved jobs (0)" or "Saved jobs (1)" etc.
    this.savedJobsBadge = page.getByRole('button', { name: /saved\s+jobs\s*\(\d+\)/i });
    this.savedJobsTab = page.getByRole('button', { name: /saved\s+jobs/i });

    // Initialize subscription locators - discovered via Playwright Inspector page snapshot
    this.emailInput = page.locator('input[type="email"]').or(page.getByPlaceholder(/email/i)).first();
    // Category select is a native <select> with accessible name "Category"
    this.categorySelect = page.getByRole('combobox', { name: 'Category' });
    // Location is a typeahead combobox with accessible name "Location Type to Search for a Location"
    // (distinct from the navigation search box which has a different accessible name)
    this.locationInput = page.getByRole('combobox', { name: 'Location Type to Search for a Location' });
    // "Add Job Alert" button (visible text "Add") adds the category+location pair to the alert list
    this.addJobAlertButton = page.getByRole('button', { name: 'Add Job Alert' });
    // Submit button has accessible name "Submit Job Alerts" (visible text "Sign Up")
    this.signUpButton = page.getByRole('button', { name: 'Submit Job Alerts' });
    // Confirmation is a plain paragraph with this exact success text (not an ARIA live region)
    this.confirmationMessage = page.getByText('Your subscription was submitted successfully');
  }

  /**
   * Navigate to jobs page
   */
  async navigate(): Promise<void> {
    await this.goto(URLS.jobsPage);
    // Handle cookie consent modal if it appears
    await this.dismissCookieConsent();
  }

  /**
   * Dismiss cookie consent modal if present
   */
  private async dismissCookieConsent(): Promise<void> {
    try {
      const acceptButton = this.page.getByRole('button', { name: 'Accept' });
      if (await acceptButton.isVisible({ timeout: 2000 })) {
        await acceptButton.click();
        await this.page.waitForTimeout(500);
      }
    } catch {
      // Cookie consent not present, continue
    }
  }

  /**
   * Dismiss system alert dialogs if present
   */
  private async dismissSystemAlerts(): Promise<void> {
    try {
      // Try multiple strategies to close the system alert
      const alertContainer = this.page.locator('#system-ialert');
      
      if (await alertContainer.isVisible({ timeout: 500 })) {
        // Strategy 1: Look for any close/dismiss button in the alert
        const closeButton = alertContainer.locator('button').first();
        if (await closeButton.isVisible({ timeout: 500 })) {
          await closeButton.click();
          await this.page.waitForTimeout(300);
        } else {
          // Strategy 2: Force hide the alert via JavaScript if it's blocking interactions
          await this.page.evaluate(() => {
            const alert = document.getElementById('system-ialert');
            if (alert) {
              alert.style.display = 'none';
            }
          });
          await this.page.waitForTimeout(300);
        }
      }
    } catch {
      // Alert dismissal failed, continue anyway
      try {
        // Last resort: force hide via CSS even if element not found
        await this.page.evaluate(() => {
          const alert = document.getElementById('system-ialert');
          if (alert) {
            alert.style.display = 'none';
            alert.remove();
          }
        });
      } catch {
        // No alert present or already dismissed
      }
    }
  }

  /**
   * Click "Explore available jobs" button
   */
  async clickExploreJobsButton(): Promise<void> {
    await this.exploreJobsButton.waitFor({ timeout: 10000 });
    await this.exploreJobsButton.click();
    await this.page.waitForLoadState('domcontentloaded');
    // Handle cookie modal if it appears after navigation
    await this.dismissCookieConsent();
  }

  /**
   * Search for jobs by title
   * @param jobTitle Job title to search for
   */
  async searchForJob(jobTitle: string): Promise<void> {
    // Ensure search input is visible and ready
    await this.searchJobTitleInput.waitFor({ timeout: 10000 });
    await this.page.waitForTimeout(500); // Brief wait for form to settle
    
    // Clear any existing text and enter new search term
    await this.searchJobTitleInput.clear();
    await this.searchJobTitleInput.fill(jobTitle);
    
    // Wait for search button to be visible and stable
    await this.searchJobsButton.waitFor({ timeout: 10000 });
    await this.page.waitForTimeout(500);
    
    // Dismiss blocking dialogs BEFORE trying to click
    await this.dismissSystemAlerts();
    await this.page.waitForTimeout(300);
    
    // Ensure button is in viewport and clickable
    await this.searchJobsButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    
    // Dismiss again in case new dialog appeared
    await this.dismissSystemAlerts();
    
    // Click search button with retry logic
    let clickSuccess = false;
    let attempts = 0;
    while (!clickSuccess && attempts < 3) {
      try {
        await this.searchJobsButton.click({ force: false, timeout: 5000 });
        clickSuccess = true;
      } catch (error) {
        attempts++;
        if (attempts >= 3) throw error;
        
        // Dialog may have reappeared, dismiss it
        await this.dismissSystemAlerts();
        await this.page.waitForTimeout(500);
      }
    }

    // Wait for search results to load
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if search returned any results
   * @returns true if results found, false if no results
   */
  async hasSearchResults(): Promise<boolean> {
    // Wait for page to load after search
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(500);

    // Check if job links are visible (look for job result links, not the search input)
    try {
      const jobLinks = this.page
        .locator('a')
        .filter({ hasText: /Manager|Designer|Developer|Accountant|Customer/ });

      // Wait for at least one result link to appear
      await jobLinks.first().waitFor({ state: 'visible', timeout: 3000 });
      return true;
    } catch {
      // If no job links found, return false
      return false;
    }
  }

  /**
   * Click on the first job in search results
   */
  async clickFirstJob(): Promise<void> {
    await this.firstJobItem.waitFor();
    // Dismiss any alerts before clicking
    await this.dismissSystemAlerts();
    await this.page.waitForTimeout(200);
    
    // Try to click with retry
    let clickSuccess = false;
    let attempts = 0;
    while (!clickSuccess && attempts < 3) {
      try {
        await this.firstJobItem.click({ timeout: 5000 });
        clickSuccess = true;
      } catch (error) {
        attempts++;
        if (attempts >= 3) throw error;
        await this.dismissSystemAlerts();
        await this.page.waitForTimeout(300);
      }
    }
    
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get the title of the first job in the list
   */
  async getFirstJobTitle(): Promise<string> {
    await this.jobTitle.waitFor();
    const text = await this.jobTitle.textContent();
    return text || '';
  }

  /**
   * Save the current job by clicking Save button
   */
  async saveCurrentJob(): Promise<void> {
    await this.saveJobButton.waitFor();
    await this.saveJobButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get the count of saved jobs from the badge
   * @returns Number of saved jobs
   */
  async getSavedJobsCount(): Promise<number> {
    try {
      await this.savedJobsBadge.waitFor({ timeout: 3000 });
      const text = await this.savedJobsBadge.textContent();
      // Extract number from text like "Saved jobs (1)" -> 1
      const match = text?.match(/\((\d+)\)/);
      return match ? parseInt(match[1], 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Click on Saved Jobs tab
   */
  async clickSavedJobsTab(): Promise<void> {
    await this.savedJobsTab.waitFor();
    await this.savedJobsTab.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get title of saved job
   */
  async getSavedJobTitle(): Promise<string> {
    await this.jobTitle.waitFor();
    const text = await this.jobTitle.textContent();
    return text || '';
  }

  /**
   * Subscribe for job alerts with email
   * @param email Email address to subscribe
   */
  async subscribeWithEmail(email: string): Promise<void> {
    await this.emailInput.waitFor();
    await this.emailInput.fill(email);
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Select a category for job alerts
   * @param category Category name to select
   */
  async selectCategory(category: string): Promise<void> {
    await this.categorySelect.waitFor();
    
    // Use selectOption with value matcher that looks for partial text match
    // The actual option is "Marketing & Communication" for "Marketing" category
    const options = await this.categorySelect.locator('option').all();
    let found = false;
    
    for (const option of options) {
      const text = await option.textContent();
      if (text && text.includes(category)) {
        const value = await option.getAttribute('value');
        await this.categorySelect.selectOption(value || '');
        found = true;
        break;
      }
    }
    
    if (!found) {
      throw new Error(`Category "${category}" not found`);
    }
  }

  /**
   * Enter location for job alerts
   * @param location Location name
   */
  async enterLocation(location: string): Promise<void> {
    await this.locationInput.waitFor();
    await this.locationInput.fill(location);

    // Wait for the debounced typeahead AJAX request to populate suggestions
    await this.page.waitForTimeout(1000);

    // Scope the suggestion search to the listbox owned by this combobox (via aria-controls)
    // to avoid matching unrelated hidden <option> elements elsewhere on the page (e.g. Category select)
    const listboxId = await this.locationInput.getAttribute('aria-controls');
    if (listboxId) {
      const listbox = this.page.locator(`#${listboxId}`);
      const firstOption = listbox.getByRole('option').first();
      try {
        await firstOption.waitFor({ timeout: 5000 });
        await firstOption.click();
        return;
      } catch {
        // No location suggestions appeared; continuing with typed text
      }
    }
  }

  /**
   * Click "Add Job Alert" button to add the selected category/location pair to the alert list
   */
  async clickAddJobAlert(): Promise<void> {
    await this.addJobAlertButton.waitFor();
    await this.addJobAlertButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Sign up for job alerts
   */
  async clickSignUp(): Promise<void> {
    await this.signUpButton.waitFor();
    await this.signUpButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Check if confirmation message is visible
   */
  async isConfirmationMessageVisible(): Promise<boolean> {
    try {
      await this.confirmationMessage.waitFor({ timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get confirmation message text
   */
  async getConfirmationMessage(): Promise<string> {
    const text = await this.confirmationMessage.textContent();
    return text || '';
  }
}