import { test, expect } from "@playwright/test";

test("brand logo matches theme", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => localStorage.setItem("nexus.theme", "light"));
  await page.reload();
  const lightLogo = page.locator('img[alt="Nexus"]').first();
  await expect(lightLogo).toHaveAttribute("src", /nexus-logo-inverted\.png$/);

  await page.evaluate(() => localStorage.setItem("nexus.theme", "dark"));
  await page.reload();
  const darkLogo = page.locator('img[alt="Nexus"]').first();
  await expect(darkLogo).toHaveAttribute("src", /nexus-logo\.png$/);
});
