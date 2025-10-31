import { test, expect } from "@playwright/test";

test("pricing tiers show correct values for each cadence", async ({ page }) => {
  await page.goto("/pricing");

  await expect(page.getByTestId("plan-free")).toContainText("Free");
  await expect(page.getByTestId("plan-academic")).toContainText("$9.99");
  await expect(page.getByTestId("plan-premium")).toContainText("$19");
  await expect(page.getByTestId("plan-pro")).toContainText("$99");

  await page.getByRole("tab", { name: "Annual" }).click();
  await expect(page.getByTestId("plan-academic")).toContainText("$99");
  await expect(page.getByTestId("plan-premium")).toContainText("$190");
  await expect(page.getByTestId("plan-pro")).toContainText("$990");

  await page.getByRole("tab", { name: "Semester" }).click();
  await expect(page.getByTestId("plan-academic")).toContainText("$35");
  await expect(page.getByTestId("plan-premium")).toContainText("$19");
  await expect(page.getByTestId("plan-pro")).toContainText("$99");
});
