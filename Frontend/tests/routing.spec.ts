import { test, expect } from "@playwright/test";

test("routing between primary pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Nexus.ai Workspace")).toBeVisible();

  await page.getByRole("link", { name: "Pricing" }).click();
  await expect(page.getByRole("heading", { name: "Nexus.ai — Where AIs debate, verify, and agree on the truth." })).toBeVisible();

  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Appearance" })).toBeVisible();
});
