import { expect, test } from "@playwright/test";

test("unknown routes render not found boundary", async ({ page }) => {
  await page.goto("/does-not-exist");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});
