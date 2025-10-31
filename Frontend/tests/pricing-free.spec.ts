import { test, expect } from "@playwright/test";

test("Free tier is present and selectable", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByText("Free")).toBeVisible();
  await page.getByRole("button", { name: "Start Free" }).click();
  await expect(page.getByText("FREE", { exact: false })).toBeVisible();
});
