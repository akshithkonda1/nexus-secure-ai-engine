import { test, expect } from "@playwright/test";
import { Buffer } from "node:buffer";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFgwJ/lBEhlwAAAABJRU5ErkJggg==",
  "base64"
);

test("avatar removal restores default state", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Guest of Nexus/ }).click();
  await page.getByRole("menuitem", { name: "Profile" }).click();

  await page.getByLabel("Workspace photo").setInputFiles({ name: "avatar.png", mimeType: "image/png", buffer: tinyPng });
  await expect(page.getByText("Photo ready. Save to keep your new avatar.")).toBeVisible();

  await page.getByRole("button", { name: "Remove photo" }).click();
  await expect(page.getByText("Default avatar will be restored when you save.")).toBeVisible();

  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.locator("[role='dialog']")).toHaveCount(0);
});
