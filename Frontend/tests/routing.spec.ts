import { test, expect } from "@playwright/test";

test.describe("routing", () => {
  test("navigates between primary routes", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 2, name: /chat|conversation/i })).toBeVisible();

    await page.getByRole("link", { name: "Pricing" }).click();
    await expect(page.getByRole("heading", { name: /Nexus\.ai — Where AIs debate, verify, and agree on the truth\./ })).toBeVisible();

    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page.getByRole("heading", { name: "Appearance" })).toBeVisible();

    await page.goto("/settings/billing");
    await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();
  });
});
