/**
 * Test Data Utilities
 *
 * Generates and manages test data consistently.
 * Prevents hardcoded test data throughout tests.
 */

/**
 * Generates a unique email address using timestamp
 * @returns Unique email in format: test-<timestamp>@example.com
 */
export const generateUniqueEmail = (): string => {
  const timestamp = Date.now();
  return `test-${timestamp}@example.com`;
};

/**
 * Validates email format
 * @param email Email to validate
 * @returns true if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Waits for a condition to be true with polling
 * @param condition Function that returns boolean
 * @param timeout Max time to wait in ms
 * @param interval Polling interval in ms
 * @returns Promise that resolves when condition is true
 * @throws Error if timeout occurs
 */
export const waitForCondition = async (
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 500
): Promise<void> => {
  const startTime = Date.now();
  let lastError: unknown;

  // eslint-disable-next-line no-constant-condition
  while (Date.now() - startTime <= timeout) {
    try {
      const result = await condition();
      if (result) {
        return;
      }
    } catch (error) {
      lastError = error;
      // Continue polling
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms timeout. Last error: ${lastError}`);
};
