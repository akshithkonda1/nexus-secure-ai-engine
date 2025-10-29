import { expect, test } from "@playwright/test";

test.describe("pricing toggles", () => {
  test("semester defaults in August and toggles update prices", async ({ page }) => {
    await page.addInitScript(() => {
      const RealDate = Date;
      class MockDate extends RealDate {
        constructor(...args: ConstructorParameters<typeof RealDate>) {
          if (args.length === 0) {
            return new RealDate("2024-08-15T12:00:00Z");
          }
          return new RealDate(...(args as []));
        }
        static now() {
          return new RealDate("2024-08-15T12:00:00Z").getTime();
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Date = MockDate;
    });

    await page.goto("/pricing");

    await expect(page.getByRole("heading", { name: "Academic" })).toBeVisible();
    await expect(page.locator("text=per semester")).toBeVisible();

    for (const price of ["$9.99", "$99", "$35", "$19", "$190", "$99", "$990"]) {
      await expect(page.locator(`text=${price}`)).toBeVisible();
    }

    await page.getByRole("button", { name: "Monthly" }).click();
    await expect(page.locator("text=per month")).toBeVisible();

    await page.getByRole("button", { name: "Annual" }).click();
    await expect(page.locator("text=per year")).toBeVisible();
  });
});
