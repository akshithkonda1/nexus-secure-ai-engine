import { test, expect } from "@playwright/test";

test("chat sends and receives", async ({ page }) => {
  await page.goto("/chat");
  const input = page.getByPlaceholder("Ask Nexus.ai anything…");
  await input.fill("Hello");
  await input.press("Enter");
  await expect(page.getByText(/Mock:/)).toBeVisible();
});
