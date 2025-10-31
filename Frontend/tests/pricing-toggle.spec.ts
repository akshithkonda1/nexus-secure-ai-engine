import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const FixedDate = class extends Date {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super("2025-01-15T12:00:00Z");
        } else {
          // @ts-ignore
          super(...args);
        }
      }
      static now() {
        return new Date("2025-01-15T12:00:00Z").getTime();
      }
    };
    // @ts-ignore
    window.Date = FixedDate;
  });
});

test("pricing cycles reflect correct amounts", async ({ page }) => {
  await page.goto("/pricing");

  const academicCard = page.getByTestId("plan-academic");
  const premiumCard = page.getByTestId("plan-premium");
  const proCard = page.getByTestId("plan-pro");

  await expect(academicCard).toContainText("$35");
  await expect(premiumCard).toContainText("$19");
  await expect(proCard).toContainText("$99");

  await page.getByRole("tab", { name: "Monthly" }).click();
  await expect(academicCard).toContainText("$9.99");
  await expect(premiumCard).toContainText("$19");
  await expect(proCard).toContainText("$99");

  await page.getByRole("tab", { name: "Annual (2 months free)" }).click();
  await expect(academicCard).toContainText("$99");
  await expect(premiumCard).toContainText("$190");
  await expect(proCard).toContainText("$990");
});
