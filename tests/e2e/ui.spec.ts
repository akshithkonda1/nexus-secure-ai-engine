import { test, expect } from "@playwright/test";

test("Ryuzen loads", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.locator("text=Home")).toBeVisible();
});

test("Command Center opens", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Command Center");
  await expect(page.locator("text=Neural Load")).toBeVisible();
});

test("Theme toggles", async ({ page }) => {
  await page.goto("/");
  await page.click("button:has-text('Theme')");
  await page.click("text=Light");
  await expect(page.locator("html[data-theme='light']")).toBeVisible();
});
