/**
 * Jobs Page Object
 *
 * Represents the IKEA jobs/careers page.
 * Handles job search, filtering, and navigation.
 *
 * Uses component-based architecture for better maintainability
 * and encapsulation of element interactions.
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TextInput } from '../components/TextInput';
import { Dropdown } from '../components/Dropdowns';
import { Button } from '../components/Buttons';
import { URLS } from '../constants/urls';

export class JobsPage extends BasePage {
  // Job exploration components
  private exploreJobsButton: Button;
  private searchJobTitleInput: TextInput;
  private searchJobsButton: Button;

  // Job display locators (complex interactions, keep as locators)
  private firstJobItem: Locator;
  private jobTitle: Locator;

  // Job save components
  private saveJobButton: Button;
  private savedJobsBadge: Locator;
  private savedJobsTab: Button;

  // Subscription components
  private emailInput: TextInput;
  private categorySelect: Dropdown;
  private locationInput: TextInput;
  private addJobAlertButton: Button;
  private signUpButton: Button;
  private confirmationMessage: Locator;

  // Sorting and pagination locators (complex interactions)
  private sortDropdown: Locator;
  private jobListItems: Locator;
  private nextPageButton: Locator;
  private paginationInfo: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize job search components with role-based locators
    this.exploreJobsButton = new Button(page.getByRole('link', { name: 'Explore available jobs' }));
    this.searchJobTitleInput = new TextInput(
      page.getByRole('searchbox', { name: 'Keyword Search' })
    );
    this.searchJobsButton = new Button(
      page.locator('button[data-last-action="search-submit"].button--blue')
    );

    // Initialize job result locators
    this.firstJobItem = page
      .locator('a')
      .filter({ hasText: /Manager|Designer|Developer|Accountant|Customer/ })
      .first();
    this.jobTitle = page.getByRole('heading').first();

    // Initialize job save components
    this.saveJobButton = new Button(page.getByLabel('Save Job'));
    this.savedJobsBadge = page.getByRole('button', { name: /saved\s+jobs\s*\(\d+\)/i });
    this.savedJobsTab = new Button(page.getByRole('button', { name: /saved\s+jobs/i }));

    // Initialize subscription components with role-based locators
    this.emailInput = new TextInput(
      page.locator('input[type="email"]').or(page.getByPlaceholder(/email/i)).first()
    );
    this.categorySelect = new Dropdown(page.getByRole('combobox', { name: 'Category' }));
    this.locationInput = new TextInput(
      page.getByRole('combobox', {
        name: 'Location Type to Search for a Location',
      })
    );
    this.addJobAlertButton = new Button(page.getByRole('button', { name: 'Add Job Alert' }));
    this.signUpButton = new Button(page.getByRole('button', { name: 'Submit Job Alerts' }));
    this.confirmationMessage = page.getByText('Your subscription was submitted successfully');

    // Initialize sorting and pagination locators
    this.sortDropdown = page.getByRole('combobox', { name: /sort|order/i }).first();
    this.jobListItems = page
      .locator('a')
      .filter({ hasText: /Manager|Designer|Developer|Accountant|Customer/ });
    this.nextPageButton = page
      .getByRole('link', { name: 'Next' })
      .or(page.locator('[aria-label*="next" i]'));
    this.paginationInfo = page.locator('text=/page|of|results/i').first();
  }

  /**
   * Navigate to jobs page
   */
  async navigate(): Promise<void> {
    await this.goto(URLS.jobs);
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
    await this.searchJobsButton.getLocator().scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);

    // Dismiss again in case new dialog appeared
    await this.dismissSystemAlerts();

    // Click search button with retry logic
    let clickSuccess = false;
    let attempts = 0;
    while (!clickSuccess && attempts < 3) {
      try {
        await this.searchJobsButton.click();
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
   * Navigate back to previous page
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Subscribe for job alerts with email
   * @param email Email address to subscribe
   */
  async subscribeWithEmail(email: string): Promise<void> {
    await this.emailInput.waitFor();
    await this.emailInput.fill(email);
  }

  /**
   * Select a category for job alerts
   * @param category Category name to select
   */
  async selectCategory(category: string): Promise<void> {
    await this.categorySelect.waitFor();

    // Use selectOption with value matcher that looks for partial text match
    // The actual option is "Marketing & Communication" for "Marketing" category
    const options = await this.categorySelect.getLocator().locator('option').all();
    let found = false;

    for (const option of options) {
      const text = await option.textContent();
      if (text?.includes(category)) {
        const value = await option.getAttribute('value');
        await this.categorySelect.selectByValue(value || '');
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
    const listboxId = await this.locationInput.getLocator().getAttribute('aria-controls');
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

    // Dismiss blocking dialogs before clicking
    await this.dismissSystemAlerts();
    await this.page.waitForTimeout(200);

    // Click with retry logic
    let clickSuccess = false;
    let attempts = 0;
    while (!clickSuccess && attempts < 3) {
      try {
        await this.addJobAlertButton.click();
        clickSuccess = true;
      } catch (error) {
        attempts++;
        if (attempts >= 3) throw error;
        await this.dismissSystemAlerts();
        await this.page.waitForTimeout(300);
      }
    }

    await this.page.waitForTimeout(300);
  }

  /**
   * Sign up for job alerts
   */
  async clickSignUp(): Promise<void> {
    await this.signUpButton.waitFor();

    // Dismiss blocking dialogs before clicking
    await this.dismissSystemAlerts();
    await this.page.waitForTimeout(200);

    // Click with retry logic
    let clickSuccess = false;
    let attempts = 0;
    while (!clickSuccess && attempts < 3) {
      try {
        await this.signUpButton.click();
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

  /**
   * Get available sort options from the dropdown
   * @returns Array of sort option labels
   */
  async getSortOptions(): Promise<string[]> {
    try {
      // First try to find any sort-related select/combobox
      const sortDropdowns = await this.page.locator('select, [role="combobox"]').all();

      for (const dropdown of sortDropdowns) {
        const label = await dropdown.getAttribute('aria-label');
        const name = await dropdown.getAttribute('name');

        // Check if this looks like a sort control
        if (label?.toLowerCase().includes('sort') || name?.toLowerCase().includes('sort')) {
          // Get options if it's a select
          const options = await dropdown.locator('option').all();
          if (options.length > 0) {
            const sortOptions: string[] = [];
            for (const option of options) {
              const text = await option.textContent();
              if (text?.trim()) {
                sortOptions.push(text.trim());
              }
            }
            return sortOptions;
          }
        }
      }

      // Alternative: look for sort buttons or links
      const sortButtons = await this.page
        .locator('button, a')
        .filter({
          hasText: /sort|order|newest|relevance/i,
        })
        .all();

      const buttonLabels: string[] = [];
      for (const button of sortButtons.slice(0, 5)) {
        const text = await button.textContent();
        if (text?.trim()) {
          buttonLabels.push(text.trim());
        }
      }

      return buttonLabels;
    } catch (error) {
      console.log('Unable to find sort options:', error);
      return [];
    }
  }

  /**
   * Select a sort option from the dropdown
   * @param sortOption Sort option to select (e.g., "Newest", "Relevance")
   */
  async selectSortOption(sortOption: string): Promise<void> {
    try {
      // Try to find sort select/combobox
      const sortDropdowns = await this.page.locator('select, [role="combobox"]').all();
      let found = false;

      for (const dropdown of sortDropdowns) {
        const label = await dropdown.getAttribute('aria-label');
        const name = await dropdown.getAttribute('name');

        if (label?.toLowerCase().includes('sort') || name?.toLowerCase().includes('sort')) {
          const options = await dropdown.locator('option').all();
          for (const option of options) {
            const text = await option.textContent();
            if (text?.includes(sortOption)) {
              const value = await option.getAttribute('value');
              await dropdown.selectOption(value || '');
              found = true;
              break;
            }
          }

          if (found) break;
        }
      }

      if (!found) {
        // Try to find and click a sort button
        const sortButton = this.page
          .locator('button, a')
          .filter({
            hasText: new RegExp(sortOption, 'i'),
          })
          .first();

        await sortButton.waitFor({ timeout: 3000 });
        await sortButton.click();
      }

      // Wait for results to update
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.error('Sort option selection failed:', error);
      throw error;
    }
  }

  /**
   * Get all job titles currently displayed on the page
   * @returns Array of job title strings
   */
  async getAllJobTitles(): Promise<string[]> {
    await this.jobListItems.first().waitFor({ timeout: 5000 });
    const items = await this.jobListItems.all();
    const titles: string[] = [];

    for (const item of items) {
      const text = await item.textContent();
      if (text?.trim?.()) {
        titles.push(text.trim());
      }
    }

    return titles;
  }

  /**
   * Check if pagination exists on the page
   * @returns true if pagination controls are present
   */
  async hasPagination(): Promise<boolean> {
    try {
      // Quick check for next button (short timeout to avoid hanging)
      const nextButton = this.page
        .locator(
          'a[rel="next"], button:has-text("Next"), a:has-text("Next"), [aria-label*="next" i]'
        )
        .first();

      const isVisible = await nextButton.isVisible({ timeout: 1000 }).catch(() => false);
      return isVisible;
    } catch {
      return false;
    }
  }

  /**
   * Get pagination information (e.g., "Page 1 of 5")
   * @returns Pagination text
   */
  async getPaginationInfo(): Promise<string> {
    try {
      // Quick check for pagination text (short timeout)
      const paginationElements = await this.page
        .locator('nav, [aria-label*="pagination" i], .pagination')
        .all();

      if (paginationElements.length > 0) {
        const text = await paginationElements[0].textContent({ timeout: 1000 });
        if (text && /page|of|results|\d+/i.test(text)) {
          if (!text.toLowerCase().includes('cookie') && !text.toLowerCase().includes('consent')) {
            return text.trim().substring(0, 100);
          }
        }
      }

      return '';
    } catch {
      return '';
    }
  }

  /**
   * Click next page button if available
   * @returns true if successful, false if next page not available
   */
  async clickNextPage(): Promise<boolean> {
    try {
      const nextButton = this.page
        .locator(
          'a[rel="next"], button:has-text("Next"), a:has-text("Next"), [aria-label*="next" i]'
        )
        .first();

      const isVisible = await nextButton.isVisible({ timeout: 1000 }).catch(() => false);
      const isDisabled = await nextButton.isDisabled().catch(() => true);

      if (!isVisible || isDisabled) {
        return false;
      }

      await nextButton.click({ timeout: 5000 });
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(300);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the total number of job results displayed on current page
   * @returns Number of job items
   */
  async getJobCount(): Promise<number> {
    try {
      const items = await this.jobListItems.all();
      return items.length;
    } catch {
      return 0;
    }
  }
}
