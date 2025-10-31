import { test, expect } from "@playwright/test";

test("pricing buttons locked", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("nexus.firstInstallISO", new Date().toISOString()));
  await page.goto("/pricing");
  await expect(page.getByRole("button", { name: /locked/i }).first()).toBeDisabled();
});
