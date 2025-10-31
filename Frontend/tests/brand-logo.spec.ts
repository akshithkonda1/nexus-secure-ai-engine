import { test, expect } from "@playwright/test";

test.describe("Brand logo theme swap", () => {
  test("dark theme uses /brand/nexus-logo.png and light uses /brand/nexus-logo-inverted.png", async ({ page }) => {
    await page.goto("/");
    const brand = page.getByTestId("brand-mark");
    const toggle = page.getByTestId("theme-toggle");

    await page.evaluate(() => localStorage.setItem("nexus.theme", "dark"));
    await page.reload();
    await expect(brand).toHaveAttribute("src", /nexus-logo\.png$/);

    await toggle.click();
    await expect(brand).toHaveAttribute("src", /nexus-logo-inverted\.png$/);
  });
});
