import { test, expect } from "@playwright/test";

test("quick action creates dummy study pack in library", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create dummy study pack" }).click();
  await expect(page.getByText("Dummy Study Pack")).toBeVisible();
});
