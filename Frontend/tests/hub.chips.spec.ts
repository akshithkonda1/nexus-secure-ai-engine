import { expect, test } from "@playwright/test";

const chips = [
  { label: "Write copy", query: "copy" },
  { label: "Image generation", query: "image" },
  { label: "Create avatar", query: "avatar" },
  { label: "Write code", query: "code" }
];

test.describe("Welcome hub chips", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Welcome to Nexus" })).toBeVisible();
  });

  for (const chip of chips) {
    test(`navigates to ${chip.label}`, async ({ page }) => {
      await page.getByRole("link", { name: chip.label }).click();
      await expect(page).toHaveURL(new RegExp(`/chat/new\\?preset=${chip.query}`));
    });
  }
});
