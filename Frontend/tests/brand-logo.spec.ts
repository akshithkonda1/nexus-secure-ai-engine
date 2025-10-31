import { test, expect } from "@playwright/test";

test("logo swaps with theme", async ({ page }) => {
  await page.goto("/");
  const img = page.locator("img[alt='Nexus']");
  await expect(img).toBeVisible();
  await page.getByRole("button", { name: "Light" }).click();
  await expect(img).toHaveAttribute("src", /nexus-logo-inverted\.png$/);
});
