import { test, expect } from "@playwright/test";

const widgetLabels = ["Lists widget", "Calendar widget", "Connectors widget", "Tasks widget"];

const modes = [
  { button: /Pages mode/i, heading: /Pages/i },
  { button: /Notes mode/i, heading: /Notes/i },
  { button: /Boards mode/i, heading: /Boards/i },
  { button: /Flows mode/i, heading: /Flows/i },
  { button: /Analyze mode/i, heading: /Analyze with Toron/i },
];

test.describe("Workspace smoke", () => {
  test("renders widgets and canvas responds to bottom bar", async ({ page }) => {
    await page.goto("/workspace");

    for (const label of widgetLabels) {
      await expect(page.getByLabel(label)).toBeVisible();
    }

    for (const mode of modes) {
      await page.getByRole("button", { name: mode.button }).click();
      await expect(page.getByRole("heading", { name: mode.heading })).toBeVisible();
    }
  });
});
