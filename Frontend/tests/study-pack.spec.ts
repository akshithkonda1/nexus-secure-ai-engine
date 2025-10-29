import { expect, test } from "@playwright/test";

test("dummy study pack action is wired", async ({ page }) => {
  await page.goto("/");
  const dialogPromise = page.waitForEvent("dialog");
  await page.getByTestId("create-study-pack").click();
  const dialog = await dialogPromise;
  expect(dialog.message()).toContain("Dummy study pack");
  await dialog.dismiss();
});
