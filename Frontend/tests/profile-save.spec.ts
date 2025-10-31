import { test, expect } from "@playwright/test";

test("profile modal saves display name", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open profile" }).click();
  const saveButton = page.getByRole("button", { name: "Save" });
  await expect(saveButton).toBeDisabled();

  const input = page.getByLabel("Display name");
  await input.fill("Researcher Prime");
  await expect(saveButton).toBeEnabled();

  await saveButton.click();
  await expect(page.getByText("Profile saved")).toBeVisible();
  await expect(saveButton).toBeDisabled();
});
