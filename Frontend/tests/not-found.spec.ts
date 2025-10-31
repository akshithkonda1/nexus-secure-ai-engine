import { test, expect } from "@playwright/test";

test("unknown route shows not found", async ({ page }) => {
  await page.goto("/does-not-exist");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
