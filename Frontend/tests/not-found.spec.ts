import { test, expect } from "@playwright/test";

test("unknown route shows 404 boundary", async ({ page }) => {
  await page.goto("/does-not-exist");
  await expect(page.getByText("We searched every channel.")).toBeVisible();
});
