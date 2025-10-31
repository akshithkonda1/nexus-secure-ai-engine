import { test, expect } from "@playwright/test";

test.describe("routing", () => {
  test("navigates between core routes", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Proof-first intelligence for every mode." })).toBeVisible();

    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: "Choose the Nexus rhythm that fits." })).toBeVisible();

    await page.goto("/settings/appearance");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });
});
