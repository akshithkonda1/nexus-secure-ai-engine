import { test, expect } from "@playwright/test";

test("logo renders from assets", async ({ page }) => {
  await page.goto("/");
  const img = page.locator("img[alt='Nexus']");
  await expect(img).toBeVisible();
  await expect(img).toHaveAttribute("src", /\/assets\/nexus-logo\.png$/);
});
