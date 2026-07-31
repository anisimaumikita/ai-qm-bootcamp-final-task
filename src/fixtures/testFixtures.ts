/**
 * Playwright Test Fixtures
 *
 * Provides initialized page objects to all tests.
 * Ensures consistent state and cleanup.
 *
 * BEST PRACTICE:
 * Using fixtures helps with:
 * - DI (Dependency Injection) of page objects
 * - Automatic setup and teardown
 * - Test isolation
 * - Code reusability
 */

import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { JobsPage } from '../pages/JobsPage';
import { JobDetailsPage } from '../pages/JobDetailsPage';

/**
 * Extend Playwright test with custom fixtures
 * These page objects are automatically initialized for each test
 */
type TestFixtures = {
  homePage: HomePage;
  jobsPage: JobsPage;
  jobDetailsPage: JobDetailsPage;
};

const test = base.extend<TestFixtures>({
  homePage: async ({ page }: { page: Page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  jobsPage: async ({ page }: { page: Page }, use) => {
    const jobsPage = new JobsPage(page);
    await use(jobsPage);
  },

  jobDetailsPage: async ({ page }: { page: Page }, use) => {
    const jobDetailsPage = new JobDetailsPage(page);
    await use(jobDetailsPage);
  },
});

export { test, expect };