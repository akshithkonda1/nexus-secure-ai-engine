import { test, expect } from "@playwright/test";

test("hub shows chips", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Welcome to Nexus")).toBeVisible();
  await expect(page.getByRole("link", { name: "Write code" })).toBeVisible();
});
