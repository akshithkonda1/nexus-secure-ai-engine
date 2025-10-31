import { test, expect } from "@playwright/test";

const tinyPng =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4z8DwHwAFgwJ/l5vJmQAAAABJRU5ErkJggg==";

test("removing avatar restores fallback", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open profile" }).click();

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: "avatar.png",
    mimeType: "image/png",
    buffer: Buffer.from(tinyPng, "base64")
  });

  await expect(page.getByText("Photo ready. Save to keep your new avatar.")).toBeVisible();

  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("button", { name: "Remove" })).toBeDisabled();
  await expect(page.getByText("NX")).toBeVisible();
});
