import { test, expect } from "@playwright/test";

test("brand logo swaps by theme", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("nexus.theme", "light");
    location.reload();
  });
  await expect(page.locator('img[alt="Nexus"]')).toHaveAttribute("src", "/brand/nexus-logo-inverted.png");

  await page.evaluate(() => {
    localStorage.setItem("nexus.theme", "dark");
    location.reload();
  });
  await expect(page.locator('img[alt="Nexus"]')).toHaveAttribute("src", "/brand/nexus-logo.png");
});
