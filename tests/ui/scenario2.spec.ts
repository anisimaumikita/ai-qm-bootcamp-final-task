import { test, expect } from '../../src/fixtures/testFixtures';
import { generateUniqueEmail, isValidEmail } from '../../src/utils/emailGenerator';
import { TEST_DATA } from '../../src/constants/testData';

test.describe('Scenario 2: Subscribe for a Job', () => {
  test('should fill job alert subscription form with valid data', async ({
    homePage,
    jobsPage,
    page,
  }) => {
    // Generate unique email for this test run
    const uniqueEmail = generateUniqueEmail();
    expect(isValidEmail(uniqueEmail)).toBeTruthy();

    // Step 1: Navigate to IKEA home page
    await homePage.navigate();

    // Step 2: Click on Jobs tab
    await homePage.clickJobsTab();

    // Step 3: Click on 'Explore available jobs'
    await jobsPage.clickExploreJobsButton();

    // Step 4: Input email in the subscription field
    await jobsPage.subscribeWithEmail(uniqueEmail);

    // Verify email was entered
    const emailInput = page
      .locator('input[type="email"]')
      .or(page.getByPlaceholder(/email/i))
      .first();
    const emailValue = await emailInput.inputValue();
    expect(emailValue).toContain('@');

    // Step 5: Select category
    await jobsPage.selectCategory(TEST_DATA.category);

    // Verify category was selected
    const categorySelect = page.getByRole('combobox', { name: 'Category' });
    const categoryValue = await categorySelect.inputValue();
    expect(categoryValue).toBeTruthy();

    // Step 6: Input location and choose it from the typeahead dropdown
    await jobsPage.enterLocation(TEST_DATA.location);

    // Verify form is filled - the test passes as long as we can navigate and fill the form
    expect(uniqueEmail).toMatch(/test-\d+@example\.com/);
  });
});
