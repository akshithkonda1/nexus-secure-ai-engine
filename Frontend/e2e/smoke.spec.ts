import { test, expect } from '@playwright/test';

test('app boots', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Nexus/i);
});
