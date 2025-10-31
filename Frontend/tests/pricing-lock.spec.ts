import { test, expect } from "@playwright/test";

test.describe("pricing lock", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const lock = {
        plan: "academic",
        firstInstallISO: "2025-01-01T00:00:00.000Z",
        lockedUntilISO: "2099-01-01T00:00:00.000Z"
      };
      window.localStorage.setItem("nexus.session", JSON.stringify(lock));
    });
  });

  test("upgrade buttons disabled while locked", async ({ page }) => {
    await page.goto("/pricing");

    const premiumButton = page.getByTestId("plan-premium").getByRole("button", { name: /Choose Premium/ });
    await expect(premiumButton).toBeDisabled();
    await premiumButton.hover();
    await expect(page.getByRole("tooltip")).toContainText("Upgrades unlock on");

    const proButton = page.getByTestId("plan-pro").getByRole("button", { name: /Choose Pro/ });
    await expect(proButton).toBeDisabled();
  });
});
