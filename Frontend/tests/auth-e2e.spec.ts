import { test, expect } from '@playwright/test';

// Helper to create test account credentials
function createTestAccount() {
  const timestamp = Date.now();
  return {
    email: `test.${timestamp}@ryuzen.test`,
    password: `Test${timestamp}!`,
    name: `Test User ${timestamp}`,
  };
}

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('full signup and login flow with auto-vaporizing account', async ({ page }) => {
    const account = createTestAccount();
    console.log(`Testing with account: ${account.email}`);

    // Should redirect to login when not authenticated
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });

    // Navigate to signup
    await page.click('text=Sign up');
    await expect(page).toHaveURL(/.*signup/);

    // Fill signup form
    await page.fill('input[id="name"]', account.name);
    await page.fill('input[id="email"]', account.email);
    await page.fill('input[id="password"]', account.password);
    await page.fill('input[id="confirmPassword"]', account.password);
    await page.check('input[type="checkbox"]');

    // Submit signup form
    await page.click('button[type="submit"]');

    // Should redirect to Toron after successful signup
    await expect(page).toHaveURL(/.*toron/, { timeout: 5000 });

    // Verify user is logged in by checking for user menu
    await expect(page.locator('[aria-label="user menu"]')).toBeVisible();

    // Logout
    await page.click('[aria-label="user menu"]');
    await page.click('text=Sign out');
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });

    // Login with same account
    await page.fill('input[id="email"]', account.email);
    await page.fill('input[id="password"]', account.password);
    await page.click('button[type="submit"]');

    // Should redirect to Toron
    await expect(page).toHaveURL(/.*toron/, { timeout: 5000 });
    await expect(page.locator('[aria-label="user menu"]')).toBeVisible();

    console.log(`Account ${account.email} test completed successfully`);
  });

  test('OAuth button rendering on login page', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    // Verify all OAuth buttons exist
    await expect(page.locator('text=Continue with Google')).toBeVisible();
    await expect(page.locator('text=Continue with Apple')).toBeVisible();
    await expect(page.locator('text=Continue with Facebook')).toBeVisible();
    await expect(page.locator('text=Continue with Microsoft')).toBeVisible();

    // Verify email/password form exists
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
  });

  test('OAuth button rendering on signup page', async ({ page }) => {
    await page.goto('http://localhost:5173/signup');

    // Verify all OAuth buttons exist
    await expect(page.locator('text=Continue with Google')).toBeVisible();
    await expect(page.locator('text=Continue with Apple')).toBeVisible();
    await expect(page.locator('text=Continue with Facebook')).toBeVisible();
    await expect(page.locator('text=Continue with Microsoft')).toBeVisible();

    // Verify signup form fields
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('input[id="confirmPassword"]')).toBeVisible();
  });

  test('protected route redirect when not authenticated', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Try accessing protected routes
    const protectedRoutes = ['/toron', '/workspace', '/settings', '/projects'];

    for (const route of protectedRoutes) {
      await page.goto(`http://localhost:5173${route}`);
      // Should redirect to login
      await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
    }
  });

  test('signup validation - password mismatch', async ({ page }) => {
    await page.goto('http://localhost:5173/signup');

    const account = createTestAccount();

    await page.fill('input[id="name"]', account.name);
    await page.fill('input[id="email"]', account.email);
    await page.fill('input[id="password"]', account.password);
    await page.fill('input[id="confirmPassword"]', 'DifferentPassword123!');
    await page.check('input[type="checkbox"]');

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/passwords do not match/i')).toBeVisible();
  });

  test('signup validation - terms not accepted', async ({ page }) => {
    await page.goto('http://localhost:5173/signup');

    const account = createTestAccount();

    await page.fill('input[id="name"]', account.name);
    await page.fill('input[id="email"]', account.email);
    await page.fill('input[id="password"]', account.password);
    await page.fill('input[id="confirmPassword"]', account.password);
    // Don't check the terms checkbox

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/agree to the terms/i')).toBeVisible();
  });

  test('login with invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    await page.fill('input[id="email"]', 'nonexistent@example.com');
    await page.fill('input[id="password"]', 'WrongPassword123!');

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/invalid|failed|expired/i')).toBeVisible({ timeout: 5000 });
  });

  test('OAuth Google login flow', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    // Click Google OAuth button
    await page.click('text=Continue with Google');

    // Should redirect to Toron after mock OAuth success
    await expect(page).toHaveURL(/.*toron/, { timeout: 5000 });

    // Verify user is logged in
    await expect(page.locator('[aria-label="user menu"]')).toBeVisible();
  });

  test('OAuth Apple login flow', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    // Click Apple OAuth button
    await page.click('text=Continue with Apple');

    // Should redirect to Toron after mock OAuth success
    await expect(page).toHaveURL(/.*toron/, { timeout: 5000 });

    // Verify user is logged in
    await expect(page.locator('[aria-label="user menu"]')).toBeVisible();
  });

  test('navigation between login and signup', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    // Navigate to signup
    await page.click('text=Sign up');
    await expect(page).toHaveURL(/.*signup/);

    // Navigate back to login
    await page.click('text=Sign in');
    await expect(page).toHaveURL(/.*login/);
  });

  test('user menu functionality', async ({ page }) => {
    // First, create an account and log in
    const account = createTestAccount();

    await page.goto('http://localhost:5173/signup');
    await page.fill('input[id="name"]', account.name);
    await page.fill('input[id="email"]', account.email);
    await page.fill('input[id="password"]', account.password);
    await page.fill('input[id="confirmPassword"]', account.password);
    await page.check('input[type="checkbox"]');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*toron/, { timeout: 5000 });

    // Open user menu
    await page.click('[aria-label="user menu"]');

    // Verify menu items are visible
    await expect(page.locator('text=Settings')).toBeVisible();
    await expect(page.locator('text=Profile')).toBeVisible();
    await expect(page.locator('text=Sign out')).toBeVisible();

    // Verify user info is displayed
    await expect(page.locator(`text=${account.name}`)).toBeVisible();
    await expect(page.locator(`text=${account.email}`)).toBeVisible();

    // Click outside to close menu
    await page.click('body');
    await expect(page.locator('text=Sign out')).not.toBeVisible();
  });

  test('redirect to toron when accessing login while authenticated', async ({ page }) => {
    // First, create an account and log in
    const account = createTestAccount();

    await page.goto('http://localhost:5173/signup');
    await page.fill('input[id="name"]', account.name);
    await page.fill('input[id="email"]', account.email);
    await page.fill('input[id="password"]', account.password);
    await page.fill('input[id="confirmPassword"]', account.password);
    await page.check('input[type="checkbox"]');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*toron/, { timeout: 5000 });

    // Try to access login page while authenticated
    await page.goto('http://localhost:5173/login');

    // Should redirect back to toron
    await expect(page).toHaveURL(/.*toron/, { timeout: 5000 });
  });
});
