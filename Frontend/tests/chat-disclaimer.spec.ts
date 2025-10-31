import { expect, test } from "@playwright/test";

test.describe("chat disclaimer", () => {
  test("renders below the composer", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByText(
        "Nexus is an experimental AI Orchestration Engine and will, like any GenAI engine, make mistakes.",
        { exact: false }
      )
    ).toBeVisible();
  });
});
