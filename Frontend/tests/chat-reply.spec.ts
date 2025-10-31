import { test, expect } from "@playwright/test";

test("assistant responds with citations", async ({ page }) => {
  await page.goto("/");

  const textarea = page.getByPlaceholder(/Direct Nexus OS with precise instructions or data references…/);
  await textarea.fill("Show me the latest status update");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByText(/Here’s a verified response to: “Show me the latest status update”/)).toBeVisible({
    timeout: 5000,
  });
  await expect(page.getByRole("link", { name: "Example Source" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Second Ref" })).toBeVisible();
});
