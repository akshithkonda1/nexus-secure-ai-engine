import { test, expect } from "@playwright/test";

test("quick action creates study pack", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Create dummy study pack" }).click();
  await expect(page.getByText("Study pack generated")).toBeVisible();

  await expect(page.getByRole("heading", { name: /Library/i })).toBeVisible();
  await expect(page.getByText(/Study Pack —/)).toBeVisible();
});
