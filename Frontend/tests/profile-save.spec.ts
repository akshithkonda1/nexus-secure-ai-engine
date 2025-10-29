import { test, expect } from "@playwright/test";

test("profile modal saves display name", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Guest of Nexus/ }).click();
  await page.getByRole("menuitem", { name: "Profile" }).click();

  const saveButton = page.getByRole("button", { name: "Save" });
  await expect(saveButton).toBeDisabled();

  await page.getByLabel("Display name").fill("Commander Ada");
  await expect(saveButton).toBeEnabled();
  await saveButton.click();

  await expect(page.getByText("Profile saved")).toBeVisible();
  await expect(page.getByRole("button", { name: /Commander Ada/ })).toBeVisible();
});
