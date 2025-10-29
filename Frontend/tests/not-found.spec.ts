import { test, expect } from "@playwright/test";

test("unknown route shows not found", async ({ page }) => {
  await page.goto("/missing-route");
  await expect(page.getByText(/corridor you entered/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to chats" })).toBeVisible();
});
