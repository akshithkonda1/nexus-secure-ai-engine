import { test, expect } from "@playwright/test";

test("pricing toggles reflect correct amounts", async ({ page }) => {
  await page.goto("/pricing");

  const month = new Date().getMonth();
  if (month === 0 || month === 7) {
    await expect(page.getByText("$35/semester")).toBeVisible();
  } else {
    await expect(page.getByText("$9.99/month")).toBeVisible();
  }
  await expect(page.getByText("$19/month")).toBeVisible();
  await expect(page.getByText("$99/month")).toBeVisible();

  await page.getByRole("button", { name: "Annual" }).click();
  await expect(page.getByText("$99/year")).toBeVisible();
  await expect(page.getByText("$190/year")).toBeVisible();
  await expect(page.getByText("$990/year")).toBeVisible();

  await page.getByRole("button", { name: "Semester" }).click();
  await expect(page.getByText("$35/semester")).toBeVisible();
  await expect(page.getByText("$19/month")).toBeVisible();
  await expect(page.getByText("$99/month")).toBeVisible();
});
