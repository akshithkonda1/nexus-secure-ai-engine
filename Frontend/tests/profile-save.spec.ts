import { expect, test } from "@playwright/test";

const PROFILE_BUTTON_SELECTOR = "button:has-text(\"Profile\")";

function randomDisplayName() {
  return `Tester ${Math.floor(Math.random() * 10000)}`;
}

test("profile modal enables save when dirty", async ({ page }) => {
  await page.goto("/");

  await page.locator(PROFILE_BUTTON_SELECTOR).click();
  await expect(page.getByRole("dialog", { name: "Edit profile" })).toBeVisible();

  const saveButton = page.getByRole("button", { name: "Save changes" });
  await expect(saveButton).toBeDisabled();

  await page.fill("#profile-display-name", randomDisplayName());
  await expect(saveButton).toBeEnabled();

  await saveButton.click();
  await expect(page.getByText("Profile saved")).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Edit profile" })).toBeHidden();
});
