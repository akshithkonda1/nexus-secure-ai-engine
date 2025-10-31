import { expect, test } from "@playwright/test";

test.describe("mode segmented control", () => {
  test("updates mode and accent and persists", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Business" }).click();

    await expect.poll(async () => {
      return page.evaluate(() => document.documentElement.getAttribute("data-mode"));
    }).toBe("business");

    const accent = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim().toLowerCase()
    );
    expect(accent).toBe("#6366f1");

    await page.reload();

    await expect.poll(async () => {
      return page.evaluate(() => document.documentElement.getAttribute("data-mode"));
    }).toBe("business");

    const accentAfterReload = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim().toLowerCase()
    );
    expect(accentAfterReload).toBe("#6366f1");
  });
});
