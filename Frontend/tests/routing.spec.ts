import { test, expect } from "@playwright/test";

test.describe("routing", () => {
  test("navigates between core routes", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Start a conversation")).toBeVisible();

    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: /Nexus.ai — Where AIs debate/ })).toBeVisible();

    await page.goto("/settings/appearance");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });
});
