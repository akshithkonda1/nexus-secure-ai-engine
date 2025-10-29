import { expect, test } from "@playwright/test";

test("theme toggle persists across reload", async ({ page }) => {
  await page.goto("/");

  const switchButton = page.getByRole("switch");
  const getTheme = () => page.evaluate(() => document.documentElement.classList.contains("dark"));

  const initialTheme = await getTheme();
  await switchButton.click();
  const toggledTheme = await getTheme();
  expect(toggledTheme).toBe(!initialTheme);

  await page.reload();
  const persistedTheme = await getTheme();
  expect(persistedTheme).toBe(toggledTheme);
});
