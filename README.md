# IKEA Jobs Website Automation Test Suite

Comprehensive Playwright test suite for IKEA jobs website automation covering job search, form validation, and listing sorting/pagination functionality.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Test Scenarios](#test-scenarios)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Test Results](#test-results)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This project automates end-to-end testing for the IKEA jobs website (https://jobs.ikea.com) using Playwright. It includes 3 comprehensive test scenarios covering critical user workflows:

- **Scenario 1**: Job search and save functionality
- **Scenario 2**: Job alert subscription form validation
- **Scenario 3**: Job listing sorting and pagination

All tests run against the **live website** across **3 browsers** (Chromium, Firefox, WebKit) sequentially for reliability.

## ✨ Features

✅ **Page Object Model Architecture** - Maintainable and scalable test structure
✅ **Multi-Browser Support** - Chromium, Firefox, and WebKit
✅ **Robust Dialog Handling** - Multiple fallback strategies for system alerts
✅ **Retry Logic** - Handles transient network issues with exponential backoff
✅ **Real-World Flexibility** - Accommodates website behavior variations
✅ **Custom Fixtures** - Dependency-injected page objects for clean test code
✅ **HTML Reporting** - Detailed test reports with screenshots on failure
✅ **Sequential Execution** - 1 worker mode ensures reliability against live site

## 📁 Project Structure

```
├── README.md                          # This file
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript configuration
├── playwright.config.ts               # Playwright configuration
│
├── src/
│   ├── pages/                         # Page Object Models
│   │   ├── BasePage.ts                # Common Playwright operations
│   │   ├── HomePage.ts                # IKEA homepage automation
│   │   ├── JobsPage.ts                # Job search, filtering, sorting, pagination
│   │   └── JobDetailsPage.ts          # Individual job details handling
│   │
│   ├── fixtures/                      # Custom Playwright fixtures
│   │   └── testFixtures.ts            # Dependency-injected page objects
│   │
│   ├── constants/                     # Test data and constants
│   │   ├── testData.ts                # Search parameters and form data
│   │   └── urls.ts                    # Website URLs
│   │
│   └── utils/                         # Utility functions
│       └── emailGenerator.ts          # Email generation and validation
│
└── tests/
    └── ui/                            # UI test scenarios
        ├── scenario1.spec.ts          # Search and save jobs
        ├── scenario2.spec.ts          # Job alert form validation
        └── scenario3.spec.ts          # Sorting and pagination
```

## 🚀 Prerequisites

- **Node.js** 16+ (https://nodejs.org/)
- **npm** 8+ (comes with Node.js)
- Internet connection (tests run against live website)

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/anisimaumikita/ai-qm-bootcamp-final-task.git
   cd ai-qm-bootcamp-final-task
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install Playwright browsers** (if not already installed)
   ```bash
   npx playwright install
   ```

## ▶️ Running Tests

### Run all tests (all scenarios × 3 browsers)

```bash
npx playwright test
```

### Run specific scenario

```bash
# Scenario 1 only
npx playwright test tests/ui/scenario1.spec.ts

# Scenario 2 only
npx playwright test tests/ui/scenario2.spec.ts

# Scenario 3 only
npx playwright test tests/ui/scenario3.spec.ts
```

### Run on specific browser

```bash
# Chromium only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# WebKit only
npx playwright test --project=webkit
```

### Run in headed mode (see browser)

```bash
npx playwright test --headed
```

### Run in debug mode

```bash
npx playwright test --debug
```

### View HTML test report

```bash
npx playwright show-report
```

## 📊 Test Scenarios

### Scenario 1: Search and Save Jobs

**File**: `tests/ui/scenario1.spec.ts`

**Workflow**:

1. Navigate to IKEA home page
2. Click Jobs tab
3. Click "Explore available jobs"
4. Search for "Manager" (fallback to "Designer" if no results)
5. Click first job in results
6. Verify job title displays
7. Save the job
8. Navigate back to jobs page
9. **Verify saved jobs count = 1** (strict assertion)
10. Click Saved Jobs tab
11. Verify saved job title exists

**Assertions**:

- Search returns results
- Job title is populated
- Saved job count is exactly 1
- Saved job appears in Saved Jobs tab

---

### Scenario 2: Job Alert Form Validation

**File**: `tests/ui/scenario2.spec.ts`

**Workflow**:

1. Navigate to IKEA home page
2. Click Jobs tab
3. Click "Explore available jobs"
4. Fill email field with unique generated email
5. Select "Marketing & Communication" category
6. Enter "Stockholm" location
7. Verify all fields are populated correctly

**Assertions**:

- Email field contains valid email format
- Category dropdown has selected value
- Location field has populated value

---

### Scenario 3: Job Sorting and Pagination

**File**: `tests/ui/scenario3.spec.ts`

**Workflow**:

1. Navigate to IKEA home page
2. Click Jobs tab
3. Click "Explore available jobs"
4. Search for "Manager"
5. Get initial job count and titles
6. Check available sort options
7. Test sorting (if options available)
8. Compare results before/after sorting
9. Check if pagination exists
10. Navigate to next page (if available)
11. Verify different results on next page

**Assertions**:

- Search returns results
- Job titles are captured
- Sort options are detected
- Pagination navigation works
- Page results change when navigating

---

## 🏗️ Architecture

### Page Object Model Pattern

Each page is represented as a class with:

- **Locators**: Private properties for element selectors
- **Methods**: Public async methods for user interactions
- **Waits**: Automatic wait strategies for stability

**Example Usage**:

```typescript
// Page object method
await jobsPage.searchForJob('Manager');
const results = await jobsPage.hasSearchResults();

// Automatic waits and error handling included
```

### Custom Fixtures

Fixtures provide dependency injection of page objects:

```typescript
test('my test', async ({ homePage, jobsPage, jobDetailsPage }) => {
  // Page objects are automatically initialized
  await homePage.navigate();
  // ...
});
```

### Error Handling

- **Dialog Dismissal**: Multi-strategy approach
  1. Click close button
  2. JavaScript force-hide
  3. Remove element entirely

- **Click Retry**: 3-attempt loops with 300-500ms waits
- **Network Waits**: `domcontentloaded` strategy (IKEA has continuous background activity)

## ⚙️ Configuration

**File**: `playwright.config.ts`

### Key Settings:

```typescript
{
  testDir: './tests',
  fullyParallel: false,          // Sequential execution
  workers: 1,                     // 1 worker for live site reliability
  timeout: 60000,                 // 60s per test
  navigationTimeout: 30000,       // 30s for navigation
  use: {
    baseURL: 'https://jobs.ikea.com',
    waitForLoadState: 'domcontentloaded'
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' }
  ]
}
```

### Timeouts:

- **Test timeout**: 60 seconds (max per test)
- **Navigation timeout**: 30 seconds (for page navigation)
- **Wait timeouts**: 1-5 seconds (for specific waits)

## 📈 Test Results

### Execution Summary:

- **Total Tests**: 9 (3 scenarios × 3 browsers)
- **Status**: ✅ All Passing
- **Browsers**: Chromium, Firefox, WebKit
- **Execution Time**: ~3.2 minutes
- **Success Rate**: 100%

### Sample Output:

```
Running 9 tests using 1 worker
✓ Scenario 1: Search for a Job
  ✓ [chromium]
  ✓ [firefox]
  ✓ [webkit]

✓ Scenario 2: Job Alert Subscription
  ✓ [chromium]
  ✓ [firefox]
  ✓ [webkit]

✓ Scenario 3: Sort Job Listings
  ✓ [chromium]
  ✓ [firefox]
  ✓ [webkit]

9 passed (3.2m)
```

## 🛠️ Key Methods

### HomePage

- `navigate()` - Navigate to IKEA home
- `clickJobsTab()` - Click Jobs navigation
- `isJobsTabVisible()` - Verify Jobs tab

### JobsPage

- `searchForJob(title)` - Search by job title
- `hasSearchResults()` - Check if results exist
- `clickFirstJob()` - Click first result
- `saveCurrentJob()` - Save a job
- `getSavedJobsCount()` - Get saved jobs count
- `clickSavedJobsTab()` - Navigate to Saved Jobs
- `selectSortOption(option)` - Change sort order
- `getAllJobTitles()` - Get list of job titles
- `hasPagination()` - Check pagination exists
- `clickNextPage()` - Go to next page
- `selectCategory(category)` - Select job alert category
- `enterLocation(location)` - Enter job alert location

### JobDetailsPage

- `getJobTitle()` - Get job posting title
- `jobTitleContains(text)` - Verify title contains text
- `saveJob()` - Save job to favorites
- `getJobDescription()` - Get full job description

## 🐛 Troubleshooting

### Tests timing out

**Solution**: Increase timeout in `playwright.config.ts` if website is slow:

```typescript
timeout: 90000; // 90 seconds instead of 60
```

### Dialog blocking clicks

**Solution**: Dialog dismissal is automatic, but you can debug:

```bash
npx playwright test --debug  # Step through test
npx playwright test --headed # See browser visually
```

### Element not found errors

**Solution**: Update selectors in page objects based on website changes:

1. Use Playwright Inspector: `npx playwright codegen`
2. Record new selectors
3. Update locators in page object

### Different results per run

**Solution**: Website returns different job listings. Tests use:

- Fallback keywords (Manager → Designer)
- Flexible assertions (title exists vs exact match)
- Pagination detection (not all locations have multiple pages)

### Network timeouts

**Solution**: Website has continuous background activity. Config uses `domcontentloaded` instead of `networkidle`:

- Faster and more reliable
- Matches real user experience

## 🔄 CI/CD Integration

Tests can be integrated into GitHub Actions:

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
```

## 📝 Test Data

### Search Parameters (`src/constants/testData.ts`)

```typescript
DEFAULT_JOB_TITLE: 'Manager'; // Primary search keyword
FALLBACK_JOB_TITLE: 'Designer'; // Backup if no results
```

### Form Data

```typescript
category: 'Marketing & Communication'
location: 'Stockholm'
email: test-${timestamp}@example.com
```

## 🎓 Learning Resources

- [Playwright Documentation](https://playwright.dev)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

## 📄 License

This project is part of the AI QM Bootcamp Final Task.

## 👤 Author

Created for automation testing practice with real-world website testing scenarios.

---

**Last Updated**: August 1, 2026
**Status**: ✅ All Tests Passing
**Current Version**: 1.0.0
