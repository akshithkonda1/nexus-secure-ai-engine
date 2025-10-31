import { test, expect } from "@playwright/test";

test("chat returns assistant message with citations", async ({ page }) => {
  await page.goto("/chat");
  const input = page.getByPlaceholder("Ask Nexus.ai anything…");
  await input.fill("Explain quantum entanglement");
  await page.getByRole("button", { name: "Send" }).click();

  const assistantMessage = page.getByText("I processed your request", { exact: false });
  await expect(assistantMessage).toBeVisible();
  const citations = page.getByText("Citations");
  await expect(citations).toBeVisible();
  await expect(page.getByRole("link", { name: "Nexus Knowledge Base" })).toBeVisible();
});
