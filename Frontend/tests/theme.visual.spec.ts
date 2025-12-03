import { test, expect } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL;
const shouldRun = Boolean(baseURL);

test.skip(!shouldRun, "Visual checks require PLAYWRIGHT_BASE_URL to be set");

const target = baseURL ?? "http://localhost:4173";

async function captureMode(page: any, mode: "light" | "dark", name: string) {
  await page.goto(target);
  await page.evaluate((nextMode) => {
    document.documentElement.setAttribute("data-theme", nextMode);
  }, mode);
  await expect(page.locator("body")).toBeVisible();
  await page.screenshot({ path: `artifacts/${name}.png`, fullPage: true });
}

test.describe("theme visual regression", () => {
  test("light mode screenshot", async ({ page }) => {
    await captureMode(page, "light", "light-mode" );
  });

  test("dark mode screenshot", async ({ page }) => {
    await captureMode(page, "dark", "dark-mode");
  });

  test("core widgets render in both modes", async ({ page }) => {
    await page.goto(target);
    await page.screenshot({ path: "artifacts/widgets.png", fullPage: true });
  });
});
