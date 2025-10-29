import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const janDate = new Date("2025-01-15T12:00:00Z");
    const RealDate = Date;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    class MockDate extends RealDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(janDate.toISOString());
          return;
        }
        super(...args);
      }
      static now() {
        return janDate.getTime();
      }
    }
    // @ts-expect-error override
    window.Date = MockDate;
  });
});

test("pricing toggles update displayed amounts", async ({ page }) => {
  await page.goto("/pricing");

  await expect(page.getByText("$35 / semester")).toBeVisible();
  await expect(page.getByText("$19 / month")).toBeVisible();
  await expect(page.getByText("$99 / month")).toBeVisible();
  await expect(page.getByText("$190 / year")).toBeVisible();
  await expect(page.getByText("$990 / year")).toBeVisible();

  await page.getByRole("button", { name: "Monthly" }).click();
  await expect(page.getByText("$9.99 / month")).toBeVisible();

  await page.getByRole("button", { name: "Annual (2 months free)" }).click();
  await expect(page.getByText("$99 / year")).toBeVisible();

  await page.getByRole("button", { name: "Semester (4 months)" }).click();
  await expect(page.getByText("$35 / semester")).toBeVisible();
  await expect(page.getByText("Semester billing not available. Displaying monthly pricing.")).toBeVisible();
});
