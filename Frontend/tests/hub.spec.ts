import { test, expect } from "@playwright/test";

test.describe("welcome hub", () => {
  test("shows hero and action chips", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Proof-first intelligence for every mode." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start chatting" })).toBeVisible();
    await expect(page.getByRole("button", { name: "View pricing" })).toBeVisible();
    await expect(page.getByText("Start a guided chat")).toBeVisible();
    await expect(page.getByText("Review recent projects")).toBeVisible();
    await expect(page.getByText("Browse the library")).toBeVisible();
    await expect(page.getByText("Check system health")).toBeVisible();
  });
});
