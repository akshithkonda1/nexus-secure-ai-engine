import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const paths = ["/", "/pricing", "/settings/appearance"];

test.describe("accessibility", () => {
  for (const path of paths) {
    test(`page ${path} has no critical violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      const critical = results.violations.filter((violation) => violation.impact === "critical");
      expect(critical).toHaveLength(0);
    });
  }
});
