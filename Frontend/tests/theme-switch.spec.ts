import { expect, test } from "@playwright/test";

test.describe("theme switch", () => {
  test("toggles dark and light themes and persists", async ({ page }) => {
    await page.goto("/");

    const themeBefore = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    const switchControl = page.getByRole("switch", { name: /toggle dark theme/i });

    await switchControl.click();

    const expectedTheme = themeBefore === "dark" ? "light" : "dark";

    await expect.poll(async () => {
      return page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    }).toBe(expectedTheme);

    await page.reload();

    await expect.poll(async () => {
      return page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    }).toBe(expectedTheme);
  });
});
