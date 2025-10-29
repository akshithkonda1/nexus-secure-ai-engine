import { test, expect } from "@playwright/test";

test("profile modal requires changes before saving", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open profile" }).click();

  const saveButton = page.getByRole("button", { name: "Save changes" });
  await expect(saveButton).toBeDisabled();

  const nameField = page.getByLabel("Display name");
  await nameField.fill("Agent Nova");
  await expect(saveButton).toBeEnabled();

  await saveButton.click();
  const toast = page.getByRole("status").filter({ hasText: "Profile updated" });
  await expect(toast).toBeVisible();
});
